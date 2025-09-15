const { Payment, Appointment } = require('../../../models');
const Stripe = require('stripe');
const crypto = require('crypto');
const notificationService = require('../../../services/notificationService');

exports.getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({ where: { user_id: userId } });
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

exports.getUserPaymentById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payment = await Payment.findOne({ where: { id: req.params.id, user_id: userId } });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

exports.createUserPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Only allow creating payment for the authenticated user
    const paymentData = { ...req.body, user_id: userId };
    const payment = await Payment.create(paymentData);
    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

// POST /checkout — Initiate payment for an appointment
exports.checkoutPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { appointment_id ,method } = req.body;

    // Fetch integration settings and check feature toggle
    const { IntegrationSettings } = require('../../../models');
    const settings = await IntegrationSettings.findOne({ order: [['updated_at', 'DESC']] });
    if (!settings || settings.stripe_enabled === false) {
      return res.status(503).json({ message: 'Payments are currently disabled by the admin.' });
    }
    if (!settings.payment_api_key) {
      return res.status(500).json({ message: 'Stripe API key is not configured.' });
    }
    const stripe = Stripe(settings.payment_api_key);

    // Validate appointment
    const appointment = await Appointment.findOne({ where: { id: appointment_id, user_id: userId } });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found or not yours' });
    if (["cancelled", "completed"].includes(appointment.status)) {
      return res.status(400).json({ message: 'Cannot pay for a cancelled or completed appointment' });
    }

    // Prevent duplicate payments (atomic)
    const [existingPayment, created] = await Payment.findOrCreate({
      where: { appointment_id },
      defaults: {
        user_id: userId,
        appointment_id,
        amount: appointment.total_price,
        method,
        status: 'pending',
        payment_date: new Date()
      }
    });
    if (!created) {
      return res.status(400).json({ message: 'Payment already exists for this appointment' });
    }

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(appointment.total_price) * 100), // cents
      currency: 'usd',
      metadata: {
        appointment_id: appointment.id,
        user_id: userId
      }
    });

    // Update the payment record with the Stripe transaction ID
    existingPayment.transaction_id = paymentIntent.id;
    await existingPayment.save();

    res.status(201).json({
      stripeClientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
};

// GET /history — User’s payment history
exports.getUserPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({ where: { user_id: userId } });
    res.json(payments);
  } catch (error) {
    next(error);
  }
}; 

// Add these endpoints to your payment controller

// Check payment status
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { payment_id } = req.params;
    
    const payment = await Payment.findOne({
      where: { id: payment_id, user_id: userId },
      include: [{
        model: Appointment,
        as: 'appointment'
      }]
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
      appointment: payment.appointment
    });
  } catch (error) {
    next(error);
  }
};

// Cancel payment (if still pending)
exports.cancelPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { payment_id } = req.params;
    
    const payment = await Payment.findOne({
      where: { id: payment_id, user_id: userId }
    });
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending payments' });
    }
    
    // Cancel with Stripe if transaction_id exists
    if (payment.transaction_id) {
      const { IntegrationSettings } = require('../../../models');
      const settings = await IntegrationSettings.findOne({ order: [['updated_at', 'DESC']] });
      if (settings && settings.payment_api_key) {
        const stripe = Stripe(settings.payment_api_key);
        await stripe.paymentIntents.cancel(payment.transaction_id);
      }
    }
    
    await payment.update({ status: 'cancelled' });
    
    res.json({ message: 'Payment cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// Get payment with appointment details
exports.getUserPaymentWithDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({
      where: { user_id: userId },
      include: [{
        model: Appointment,
        as: 'appointment',
        include: ['salon', 'staff', 'services']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// Stripe Webhook Handler
exports.stripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const { IntegrationSettings } = require('../../../models');
    
    // Get webhook secret from settings
    const settings = await IntegrationSettings.findOne({ 
      order: [['updated_at', 'DESC']] 
    });
    
    if (!settings || !settings.stripe_webhook_secret) {
      console.error('Webhook secret not configured');
      return res.status(400).json({ error: 'Webhook secret not configured' });
    }

    if (!settings.payment_api_key) {
      console.error('Stripe API key not configured');
      return res.status(500).json({ error: 'Stripe API key not configured' });
    }

    const stripe = Stripe(settings.payment_api_key);
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, settings.stripe_webhook_secret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log(`Processing webhook event: ${event.type}`);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2));

    // Handle the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Processing payment_intent.succeeded...');
          await handlePaymentSucceeded(event.data.object);
          console.log('Payment processing completed successfully');
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object);
          break;
        case 'payment_intent.canceled':
          await handlePaymentCanceled(event.data.object);
          break;
        case 'charge.refunded':
          await handlePaymentRefunded(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (webhookError) {
      console.error(`Error processing webhook event ${event.type}:`, webhookError);
      // Don't return error to Stripe, just log it
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    next(error);
  }
};

async function handlePaymentSucceeded(paymentIntent) {
  const { Payment, Appointment } = require('../../../models');
  const subscriptionPaymentService = require('../../../services/subscriptionPaymentService');
  
  console.log('handlePaymentSucceeded called with paymentIntent:', JSON.stringify(paymentIntent, null, 2));
  
  try {
    // Check if this is a subscription payment
    if (paymentIntent.metadata && paymentIntent.metadata.subscription_payment_id) {
      console.log(`Processing subscription payment: ${paymentIntent.metadata.subscription_payment_id}`);
      
      try {
        const subscription = await subscriptionPaymentService.handleSuccessfulSubscriptionPayment(paymentIntent.id);
        console.log(`Subscription created successfully: ${subscription.id}`);
        
        // Send notification to salon owner (if notification service is available)
        try {
          const notificationService = require('../../../services/notificationService');
          await notificationService.sendToUsers([
            paymentIntent.metadata.user_id,
            paymentIntent.metadata.owner_id
          ], 'Subscription Activated', 'Your subscription payment was successful and your salon subscription is now active.', { 
            subscriptionId: subscription.id,
            salonId: paymentIntent.metadata.salon_id,
            ownerId: paymentIntent.metadata.owner_id
          });
        } catch (notificationError) {
          console.warn('Could not send notification:', notificationError.message);
        }
        
        return;
      } catch (subscriptionError) {
        console.error('Error processing subscription payment:', subscriptionError);
        // Continue to check for regular appointment payment
      }
    }
    
    // Handle regular appointment payment
    const payment = await Payment.findOne({ 
      where: { transaction_id: paymentIntent.id } 
    });
    
    if (!payment) {
      console.warn(`Payment not found for transaction_id: ${paymentIntent.id}`);
      return;
    }
    
    // Use transaction to ensure data consistency
    await Payment.sequelize.transaction(async (t) => {
      // Update payment status
      await payment.update({
        status: 'paid',
        payment_date: new Date(),
        updated_at: new Date()
      }, { transaction: t });
      
      // Update appointment status to 'booked'
      await Appointment.update(
        { 
          status: 'booked',
          updated_at: new Date()
        },
        { 
          where: { id: payment.appointment_id },
          transaction: t
        }
      );
    });
    // Send notification to user
    await notificationService.sendToUsers([
      payment.user_id
    ], 'Payment Successful', 'Your payment was successful and your appointment is now booked.', { appointmentId: payment.appointment_id });
    
    console.log(`Payment ${payment.id} marked as paid, appointment ${payment.appointment_id} booked`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent) {
  const { Payment, Appointment } = require('../../../models');
  
  try {
    const payment = await Payment.findOne({ 
      where: { transaction_id: paymentIntent.id } 
    });
    
    if (!payment) {
      console.warn(`Payment not found for transaction_id: ${paymentIntent.id}`);
      return;
    }
    
    // Use transaction to ensure data consistency
    await Payment.sequelize.transaction(async (t) => {
      // Update payment status
      await payment.update({
        status: 'failed',
        updated_at: new Date()
      }, { transaction: t });
      
      // Update appointment status to 'cancelled' if payment failed
      await Appointment.update(
        { 
          status: 'cancelled',
          updated_at: new Date()
        },
        { 
          where: { id: payment.appointment_id },
          transaction: t
        }
      );
    });
    
    console.log(`Payment ${payment.id} marked as failed, appointment ${payment.appointment_id} cancelled`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

async function handlePaymentCanceled(paymentIntent) {
  const { Payment, Appointment } = require('../../../models');
  
  try {
    const payment = await Payment.findOne({ 
      where: { transaction_id: paymentIntent.id } 
    });
    
    if (!payment) {
      console.warn(`Payment not found for transaction_id: ${paymentIntent.id}`);
      return;
    }
    
    // Use transaction to ensure data consistency
    await Payment.sequelize.transaction(async (t) => {
      // Update payment status
      await payment.update({
        status: 'cancelled',
        updated_at: new Date()
      }, { transaction: t });
      
      // Update appointment status to 'cancelled'
      await Appointment.update(
        { 
          status: 'cancelled',
          updated_at: new Date()
        },
        { 
          where: { id: payment.appointment_id },
          transaction: t
        }
      );
    });
    
    console.log(`Payment ${payment.id} marked as cancelled, appointment ${payment.appointment_id} cancelled`);
  } catch (error) {
    console.error('Error handling payment canceled:', error);
    throw error;
  }
}

async function handlePaymentRefunded(charge) {
  const { Payment, Appointment } = require('../../../models');
  
  try {
    const payment = await Payment.findOne({ 
      where: { transaction_id: charge.payment_intent } 
    });
    
    if (!payment) {
      console.warn(`Payment not found for payment_intent: ${charge.payment_intent}`);
      return;
    }
    
    // Use transaction to ensure data consistency
    await Payment.sequelize.transaction(async (t) => {
      // Update payment status
      await payment.update({
        status: 'refunded',
        updated_at: new Date()
      }, { transaction: t });
      
      // Update appointment status to 'cancelled' for refunds
      await Appointment.update(
        { 
          status: 'cancelled',
          updated_at: new Date()
        },
        { 
          where: { id: payment.appointment_id },
          transaction: t
        }
      );
    });
    
    console.log(`Payment ${payment.id} marked as refunded, appointment ${payment.appointment_id} cancelled`);
  } catch (error) {
    console.error('Error handling payment refunded:', error);
    throw error;
  }
}