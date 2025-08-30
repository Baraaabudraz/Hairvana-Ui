const { SubscriptionPayment, SubscriptionPlan, Salon, User, Subscription } = require('../models');
const Stripe = require('stripe');

/**
 * Create a subscription payment intent
 * @param {Object} data - Payment data
 * @returns {Object} Payment intent with client secret
 */
exports.createSubscriptionPaymentIntent = async (data) => {
  const { planId, billingCycle, userId } = data;

  // Validate inputs
  if (!planId || !userId) {
    throw new Error('Plan ID and User ID are required');
  }

  // Get plan details
  const plan = await SubscriptionPlan.findByPk(planId);
  if (!plan) {
    throw new Error('Invalid plan ID');
  }

  // Verify user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('Invalid user ID');
  }

  // Calculate amount based on billing cycle
  const amount = billingCycle === 'yearly' ? plan.yearly_price : plan.price;

  // Get Stripe configuration
  const { IntegrationSettings } = require('../models');
  const settings = await IntegrationSettings.findOne({ order: [['updated_at', 'DESC']] });
  
  if (!settings || settings.stripe_enabled === false) {
    throw new Error('Payments are currently disabled by the admin.');
  }
  
  if (!settings.payment_api_key) {
    throw new Error('Stripe API key is not configured.');
  }

  const stripe = Stripe(settings.payment_api_key);

  // Create subscription payment record
  const subscriptionPayment = await SubscriptionPayment.create({
    owner_id: userId,
    plan_id: planId,
    amount: amount,
    billing_cycle: billingCycle,
    method: 'stripe',
    status: 'pending',
    expires_at: billingCycle === 'yearly' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
    metadata: {
      plan_name: plan.name,
      owner_name: user.name || user.email,
      billing_cycle: billingCycle
    }
  });

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      subscription_payment_id: subscriptionPayment.id,
      owner_id: userId,
      plan_id: planId,
      billing_cycle: billingCycle
    },
    description: `Subscription payment for ${plan.name} plan - ${user.name || user.email}`,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Update payment record with Stripe details
  await subscriptionPayment.update({
    payment_intent_id: paymentIntent.id,
    client_secret: paymentIntent.client_secret,
    transaction_id: paymentIntent.id
  });

  return {
    paymentId: subscriptionPayment.id,
    clientSecret: paymentIntent.client_secret,
    amount: amount,
    currency: 'usd',
    plan: {
      id: plan.id,
      name: plan.name,
      description: plan.description
    },
    owner: {
      id: user.id,
      name: user.name || user.email
    },
    billingCycle: billingCycle,
    expiresAt: subscriptionPayment.expires_at
  };
};

/**
 * Get subscription payment by ID
 * @param {string} paymentId - Payment ID
 * @param {string} userId - User ID for verification
 * @returns {Object} Payment details
 */
exports.getSubscriptionPaymentById = async (paymentId, userId) => {
  const payment = await SubscriptionPayment.findOne({
    where: { id: paymentId, owner_id: userId },
    include: [
      { model: SubscriptionPlan, as: 'plan' },
      { model: User, as: 'owner' }
    ]
  });

  if (!payment) {
    throw new Error('Payment not found or access denied');
  }

  return payment.toJSON();
};

/**
 * Get subscription payments for a salon
 * @param {string} salonId - Salon ID
 * @param {string} userId - User ID for verification
 * @returns {Array} Payment history
 */
exports.getSubscriptionPaymentsByOwnerId = async (userId) => {
  const payments = await SubscriptionPayment.findAll({
    where: { owner_id: userId },
    include: [
      { model: SubscriptionPlan, as: 'plan' },
      { model: User, as: 'owner' }
    ],
    order: [['created_at', 'DESC']]
  });

  return payments.map(payment => payment.toJSON());
};

/**
 * Cancel a subscription payment
 * @param {string} paymentId - Payment ID
 * @param {string} userId - User ID for verification
 * @returns {Object} Cancelled payment
 */
exports.cancelSubscriptionPayment = async (paymentId, userId) => {
  const payment = await SubscriptionPayment.findOne({
    where: { id: paymentId, owner_id: userId }
  });

  if (!payment) {
    throw new Error('Payment not found or access denied');
  }

  if (payment.status !== 'pending') {
    throw new Error('Can only cancel pending payments');
  }

  // Cancel with Stripe if payment intent exists
  if (payment.payment_intent_id) {
    const { IntegrationSettings } = require('../models');
    const settings = await IntegrationSettings.findOne({ order: [['updated_at', 'DESC']] });
    
    if (settings && settings.payment_api_key) {
      const stripe = Stripe(settings.payment_api_key);
      try {
        await stripe.paymentIntents.cancel(payment.payment_intent_id);
      } catch (stripeError) {
        console.error('Error cancelling Stripe payment intent:', stripeError);
        // Continue with local cancellation even if Stripe fails
      }
    }
  }

  await payment.update({ status: 'cancelled' });

  return payment.toJSON();
};

/**
 * Handle successful subscription payment (called by webhook)
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Object} Created subscription
 */
exports.handleSuccessfulSubscriptionPayment = async (paymentIntentId) => {
  const payment = await SubscriptionPayment.findOne({
    where: { payment_intent_id: paymentIntentId }
  });

  if (!payment) {
    throw new Error(`Payment not found for payment intent: ${paymentIntentId}`);
  }

  if (payment.status === 'paid') {
    // Payment already processed
    return await this.getSubscriptionByPaymentId(payment.id);
  }

  // Use transaction to ensure data consistency
  const result = await SubscriptionPayment.sequelize.transaction(async (t) => {
    // Update payment status
    await payment.update({
      status: 'paid',
      payment_date: new Date()
    }, { transaction: t });

    // Get plan details
    const plan = await SubscriptionPlan.findByPk(payment.plan_id, { transaction: t });
    
    // Get owner details
    const owner = await User.findByPk(payment.owner_id, { transaction: t });
    
    // Get all salons belonging to this owner
    const salons = await Salon.findAll({
      where: { owner_id: payment.owner_id },
      transaction: t
    });

    if (salons.length === 0) {
      throw new Error('No salons found for this owner');
    }

    // Calculate next billing date
    const startDate = new Date();
    const nextBillingDate = new Date(startDate);
    
    if (payment.billing_cycle === 'yearly') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    // Initialize usage with plan limits
    const usage = {
      bookings: 0,
      bookingsLimit: plan.limits?.bookings || 0,
      staff: 0,
      staffLimit: plan.limits?.staff || 0,
      locations: salons.length,
      locationsLimit: plan.limits?.locations || 1,
    };

    // Create subscription for the owner (not tied to a specific salon)
    const subscription = await Subscription.create({
      planId: payment.plan_id,
      paymentId: payment.id,
      amount: payment.amount,
      startDate: startDate,
      nextBillingDate: nextBillingDate,
      status: 'active',
      billingCycle: payment.billing_cycle,
      billingPeriod: payment.billing_cycle,
      usage: usage,
      ownerId: payment.owner_id, // Link to owner instead of specific salon
    }, { transaction: t });

    return { subscription, payment, plan, owner };
  });

  // Send invoice email after successful transaction
  try {
    const emailService = require('./emailService');
    const emailSent = await emailService.sendInvoiceEmail(
      result.owner.email,
      result.payment,
      result.subscription,
      result.plan,
      result.owner
    );
    
    if (emailSent) {
      console.log(`Invoice email sent successfully to ${result.owner.email} for payment ${result.payment.id}`);
    } else {
      console.error(`Failed to send invoice email to ${result.owner.email} for payment ${result.payment.id}`);
    }
  } catch (emailError) {
    console.error('Error sending invoice email:', emailError);
    // Don't fail the payment process if email fails
  }

  return result.subscription;
};

/**
 * Get subscription by payment ID
 * @param {string} paymentId - Payment ID
 * @returns {Object} Subscription details
 */
 exports.getSubscriptionByPaymentId = async (paymentId) => {
   const subscription = await Subscription.findOne({
     where: { paymentId: paymentId },
     include: [
       { model: SubscriptionPlan, as: 'plan' },
       { model: User, as: 'owner' }
     ]
   });

   if (!subscription) {
     throw new Error('Subscription not found for this payment');
   }

   return subscription.toJSON();
 };

/**
 * Manually send invoice email for a payment
 * @param {string} paymentId - Payment ID
 * @param {string} userId - User ID for verification
 * @returns {Object} Email sending result
 */
exports.sendInvoiceEmailForPayment = async (paymentId, userId) => {
  const payment = await SubscriptionPayment.findOne({
    where: { id: paymentId, owner_id: userId },
    include: [
      { model: SubscriptionPlan, as: 'plan' },
      { model: User, as: 'owner' }
    ]
  });

  if (!payment) {
    throw new Error('Payment not found or access denied');
  }

  // Get subscription if it exists
  let subscription = null;
  try {
    subscription = await Subscription.findOne({
      where: { paymentId: paymentId }
    });
  } catch (error) {
    console.log('No subscription found for payment:', paymentId);
  }

  // Send invoice email
  const emailService = require('./emailService');
  const emailSent = await emailService.sendInvoiceEmail(
    payment.owner.email,
    payment,
    subscription,
    payment.plan,
    payment.owner
  );

  return {
    success: emailSent,
    email: payment.owner.email,
    paymentId: payment.id,
    message: emailSent ? 'Invoice email sent successfully' : 'Failed to send invoice email'
  };
};
