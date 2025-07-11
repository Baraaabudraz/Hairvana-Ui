const { Payment, Appointment } = require('../../models');
const Stripe = require('stripe');

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
  const t = await sequelize.transaction(); // Add transaction support
  
  try {
    const userId = req.user.id;
    const { appointment_id, method } = req.body;

    // Validate input
    if (!appointment_id || !method) {
      return res.status(400).json({ message: 'Appointment ID and payment method are required' });
    }

    // Fetch integration settings
    const { IntegrationSettings } = require('../../models');
    const settings = await IntegrationSettings.findOne({ order: [['updated_at', 'DESC']] });
    if (!settings || settings.stripe_enabled === false) {
      return res.status(503).json({ message: 'Payments are currently disabled by the admin.' });
    }
    if (!settings.payment_api_key) {
      return res.status(500).json({ message: 'Stripe API key is not configured.' });
    }
    const stripe = Stripe(settings.payment_api_key);

    // Validate appointment
    const appointment = await Appointment.findOne({ 
      where: { id: appointment_id, user_id: userId },
      transaction: t
    });
    if (!appointment) {
      await t.rollback();
      return res.status(404).json({ message: 'Appointment not found or not yours' });
    }
    if (["cancelled", "completed"].includes(appointment.status)) {
      await t.rollback();
      return res.status(400).json({ message: 'Cannot pay for a cancelled or completed appointment' });
    }

    // Check if appointment amount is valid
    if (!appointment.total_price || appointment.total_price <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid appointment amount' });
    }

    // Prevent duplicate payments
    const [payment, created] = await Payment.findOrCreate({
      where: { appointment_id },
      defaults: {
        user_id: userId,
        appointment_id,
        amount: appointment.total_price,
        method,
        status: 'pending',
        payment_date: new Date()
      },
      transaction: t
    });

    if (!created) {
      await t.rollback();
      return res.status(400).json({ message: 'Payment already exists for this appointment' });
    }

    // Create PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(appointment.total_price) * 100), // cents
      currency: 'usd',
      metadata: {
        appointment_id: appointment.id,
        user_id: userId,
        payment_id: payment.id
      }
    });

    // Update payment with transaction ID
    payment.transaction_id = paymentIntent.id;
    await payment.save({ transaction: t });

    await t.commit();

    res.status(201).json({
      payment_id: payment.id,
      stripeClientSecret: paymentIntent.client_secret,
      amount: appointment.total_price
    });
  } catch (error) {
    await t.rollback();
    console.error('Checkout error:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({ message: 'Payment failed: ' + error.message });
    }
    
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
      const { IntegrationSettings } = require('../../models');
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