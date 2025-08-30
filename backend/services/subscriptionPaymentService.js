const { SubscriptionPayment, SubscriptionPlan, Salon, User, Subscription } = require('../models');
const Stripe = require('stripe');

/**
 * Create a subscription payment intent
 * @param {Object} data - Payment data
 * @returns {Object} Payment intent with client secret
 */
exports.createSubscriptionPaymentIntent = async (data) => {
  const { salonId, planId, billingCycle, userId } = data;

  // Validate inputs
  if (!salonId || !planId || !userId) {
    throw new Error('Salon ID, Plan ID, and User ID are required');
  }

  // Get plan details
  const plan = await SubscriptionPlan.findByPk(planId);
  if (!plan) {
    throw new Error('Invalid plan ID');
  }

  // Get salon details and verify ownership
  const salon = await Salon.findByPk(salonId);
  if (!salon) {
    throw new Error('Invalid salon ID');
  }

  if (salon.owner_id !== userId) {
    throw new Error('Access denied. You can only pay for your own salons.');
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
    user_id: userId,
    salon_id: salonId,
    plan_id: planId,
    amount: amount,
    billing_cycle: billingCycle,
    method: 'stripe',
    status: 'pending',
    expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    metadata: {
      plan_name: plan.name,
      salon_name: salon.name,
      billing_cycle: billingCycle
    }
  });

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(amount) * 100), // Convert to cents
    currency: 'usd',
    metadata: {
      subscription_payment_id: subscriptionPayment.id,
      salon_id: salonId,
      plan_id: planId,
      user_id: userId,
      billing_cycle: billingCycle
    },
    description: `Subscription payment for ${plan.name} plan - ${salon.name}`,
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
    salon: {
      id: salon.id,
      name: salon.name
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
    where: { id: paymentId, user_id: userId },
    include: [
      { model: SubscriptionPlan, as: 'plan' },
      { model: Salon, as: 'salon' },
      { model: User, as: 'user' }
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
exports.getSubscriptionPaymentsBySalonId = async (salonId, userId) => {
  // Verify salon ownership
  const salon = await Salon.findByPk(salonId);
  if (!salon || salon.owner_id !== userId) {
    throw new Error('Access denied. You can only view payments for your own salons.');
  }

  const payments = await SubscriptionPayment.findAll({
    where: { salon_id: salonId },
    include: [
      { model: SubscriptionPlan, as: 'plan' },
      { model: User, as: 'user' }
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
    where: { id: paymentId, user_id: userId }
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

    // Create subscription
    const plan = await SubscriptionPlan.findByPk(payment.plan_id, { transaction: t });
    const salon = await Salon.findByPk(payment.salon_id, { transaction: t });

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
      locations: 1,
      locationsLimit: plan.limits?.locations || 1,
    };

    // Create subscription
    const subscription = await Subscription.create({
      salonId: payment.salon_id,
      planId: payment.plan_id,
      paymentId: payment.id,
      amount: payment.amount,
      startDate: startDate,
      nextBillingDate: nextBillingDate,
      status: 'active',
      billingCycle: payment.billing_cycle,
      billingPeriod: payment.billing_cycle,
      usage: usage,
    }, { transaction: t });

    return subscription;
  });

  return result;
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
      { model: Salon, as: 'salon' }
    ]
  });

  if (!subscription) {
    throw new Error('Subscription not found for this payment');
  }

  return subscription.toJSON();
};
