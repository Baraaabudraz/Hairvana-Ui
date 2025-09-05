const { SubscriptionPayment, SubscriptionPlan, Salon, User, Subscription, BillingHistory } = require('../models');
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

  // Check if user already has an active subscription
  const existingSubscription = await Subscription.findOne({
    where: { 
      owner_id: userId,
      status: 'active'
    }
  });

  if (existingSubscription) {
    throw new Error('You already have an active subscription. Please upgrade or cancel your existing subscription first.');
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

  // Send initial (pending) invoice email upon downgrade intent creation
  try {
    const emailService = require('./emailService');
    await emailService.sendInvoiceEmail(
      user.email,
      subscriptionPayment,
      null,
      plan,
      user
    );
  } catch (emailInitErr) {
    console.error('Failed to send initial invoice email (downgrade create-intent):', emailInitErr);
  }

  // Send initial (pending) invoice email upon upgrade intent creation
  try {
    const emailService = require('./emailService');
    await emailService.sendInvoiceEmail(
      user.email,
      subscriptionPayment,
      null,
      plan,
      user
    );
  } catch (emailInitErr) {
    console.error('Failed to send initial invoice email (upgrade create-intent):', emailInitErr);
  }

  // Send initial (pending) invoice email upon payment intent creation
  try {
    const emailService = require('./emailService');
    await emailService.sendInvoiceEmail(
      user.email,
      subscriptionPayment,
      null,
      plan,
      user
    );
  } catch (emailInitErr) {
    console.error('Failed to send initial invoice email (subscription create-intent):', emailInitErr);
  }

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

  // Check if this is an upgrade/downgrade payment
  const isUpgradePayment = payment.metadata?.upgrade_type && payment.metadata?.current_subscription_id;
  
  if (isUpgradePayment) {
    // Handle upgrade/downgrade payment
    return await this.handleUpgradePayment(payment);
  }

  // Double-check: Ensure user doesn't already have an active subscription
  const existingSubscription = await Subscription.findOne({
    where: { 
      owner_id: payment.owner_id,
      status: 'active'
    }
  });

  if (existingSubscription) {
    // Update payment status to cancelled since we can't create duplicate subscription
    await payment.update({ 
      status: 'cancelled',
      metadata: {
        ...payment.metadata,
        cancellation_reason: 'User already has active subscription'
      }
    });
    throw new Error('Cannot create subscription: User already has an active subscription');
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

    // Create billing history record
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await BillingHistory.create({
      subscription_id: subscription.id,
      date: new Date(),
      amount: payment.amount,
      status: 'paid',
      description: `New subscription payment for ${plan.name} plan - ${payment.billing_cycle}`,
      transaction_id: `TXN-${payment.id.slice(0, 8).toUpperCase()}`,
      invoice_number: invoiceNumber,
      subtotal: payment.amount,
      total: payment.amount,
      tax_amount: 0
    }, { transaction: t });

    return { subscription, payment, plan, owner, invoiceNumber };
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

  // Ensure billing history record exists
  if (subscription) {
    const existingBillingHistory = await BillingHistory.findOne({
      where: { subscription_id: subscription.id }
    });

    if (!existingBillingHistory) {
      // Create billing history record if it doesn't exist
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await BillingHistory.create({
        subscription_id: subscription.id,
        date: payment.payment_date || new Date(),
        amount: payment.amount,
        status: payment.status,
        description: `Payment for ${payment.plan?.name || 'subscription'} plan - ${payment.billing_cycle}`,
        invoice_number: invoiceNumber,
        subtotal: payment.amount,
        total: payment.amount,
        tax_amount: 0
      });
      console.log(`Created missing billing history record for payment ${paymentId}`);
    }
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

/**
 * Ensure billing history records exist for all payments
 * This function can be used to backfill missing billing history records
 * @returns {Object} Result of the backfill operation
 */
exports.ensureBillingHistoryForAllPayments = async () => {
  try {
    const payments = await SubscriptionPayment.findAll({
      where: { status: 'paid' },
      include: [
        { model: SubscriptionPlan, as: 'plan' },
        { model: User, as: 'owner' }
      ]
    });

    let createdCount = 0;
    let existingCount = 0;

    for (const payment of payments) {
      // Find subscription for this payment
      const subscription = await Subscription.findOne({
        where: { paymentId: payment.id }
      });

      if (subscription) {
        // Check if billing history already exists
        const existingBillingHistory = await BillingHistory.findOne({
          where: { subscription_id: subscription.id }
        });

        if (!existingBillingHistory) {
          // Create billing history record
          const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          await BillingHistory.create({
            subscription_id: subscription.id,
            date: payment.payment_date || new Date(),
            amount: payment.amount,
            status: payment.status,
            description: `Payment for ${payment.plan?.name || 'subscription'} plan - ${payment.billing_cycle}`,
            invoice_number: invoiceNumber,
            subtotal: payment.amount,
            total: payment.amount,
            tax_amount: 0
          });
          createdCount++;
        } else {
          existingCount++;
        }
      }
    }

    return {
      success: true,
      message: `Billing history backfill completed`,
      created: createdCount,
      existing: existingCount,
      total: payments.length
    };
  } catch (error) {
    console.error('Error ensuring billing history for all payments:', error);
    throw error;
  }
};

/**
 * Refund a subscription payment (separate from cancellation)
 * @param {string} paymentId - Payment ID to refund
 * @param {string} userId - Authenticated owner ID
 * @returns {Object} Refund result and updated entities
 */
exports.refundSubscriptionPayment = async (paymentId, userId, refundReasonInput) => {
  // Validate payment
  const payment = await SubscriptionPayment.findOne({
    where: { id: paymentId, owner_id: userId }
  });

  if (!payment) {
    throw new Error('Payment not found or access denied');
  }

  if (payment.status !== 'paid') {
    throw new Error('Only paid payments can be refunded');
  }

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

  // Try to locate the subscription linked to this payment (may not exist for upgrades)
  let subscription = await Subscription.findOne({ where: { paymentId: payment.id } });

  // Calculate refund eligibility window (10 days) based on subscription start or payment date
  const referenceDate = subscription?.startDate || payment.payment_date || payment.createdAt;
  const daysSinceStart = Math.floor((Date.now() - new Date(referenceDate)) / (1000 * 60 * 60 * 24));
  const refundWindowDays = 10;
  const isEligibleForRefund = daysSinceStart <= refundWindowDays;

  if (!isEligibleForRefund) {
    return {
      success: false,
      message: `Refund window expired (${daysSinceStart} days > ${refundWindowDays} days)`,
      data: {
        payment: { id: payment.id, status: payment.status },
        subscription: subscription ? { id: subscription.id, status: subscription.status } : null
      }
    };
  }

  if (!payment.payment_intent_id) {
    throw new Error('Stripe payment intent not found for this payment');
  }

  // Map custom reason to Stripe's limited reasons when possible
  const normalizedReason = (refundReasonInput || '').toLowerCase();
  const stripeReasonMap = {
    'requested_by_customer': 'requested_by_customer',
    'duplicate': 'duplicate',
    'fraudulent': 'fraudulent',
    'customer_request': 'requested_by_customer',
    'change_of_mind': 'requested_by_customer',
    'not_satisfied': 'requested_by_customer'
  };
  const stripeReason = stripeReasonMap[normalizedReason] || 'requested_by_customer';

  // Perform Stripe refund
  const refund = await stripe.refunds.create({
    payment_intent: payment.payment_intent_id,
    amount: Math.round(Number(payment.amount) * 100),
    reason: stripeReason,
    metadata: {
      owner_id: userId,
      subscription_id: subscription?.id || null,
      refund_window_days: refundWindowDays.toString(),
      days_since_start: daysSinceStart.toString(),
      refund_type: 'full_refund_within_window',
      refund_reason: refundReasonInput
    }
  });

  // Persist updates atomically
  await SubscriptionPayment.sequelize.transaction(async (t) => {
    await payment.update({
      status: 'refunded',
      refund_amount: payment.amount,
      refund_reason: refundReasonInput,
      metadata: {
        ...(payment.metadata || {}),
        refunded_at: new Date(),
        refund_id: refund.id,
        refund_window_days: refundWindowDays,
        days_since_start: daysSinceStart,
        refund_reason: refundReasonInput
      }
    }, { transaction: t });

    // If a subscription exists, create a refund billing record.
    if (subscription) {
      const refundInvoiceNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      await BillingHistory.create({
        subscription_id: subscription.id,
        date: new Date(),
        amount: -Number(payment.amount),
        status: 'refunded',
        description: `Refund for subscription payment within ${refundWindowDays}-day window`,
        transaction_id: `TXN-${payment.id.slice(0, 8).toUpperCase()}-REF`,
        invoice_number: refundInvoiceNumber,
        subtotal: -Number(payment.amount),
        total: -Number(payment.amount),
        tax_amount: 0
      }, { transaction: t });
    }
  });

  // Send refund invoice email if we can resolve owner and plan
  try {
    const owner = await User.findByPk(payment.owner_id);
    const plan = await SubscriptionPlan.findByPk(payment.plan_id);
    if (owner && plan && subscription) {
      const emailService = require('./emailService');
      await emailService.sendInvoiceEmail(owner.email, payment, subscription, plan, owner);
    }
  } catch (emailError) {
    console.error('Error sending refund invoice email:', emailError);
  }

  return {
    success: true,
    message: `Refund processed successfully for $${Number(payment.amount).toFixed(2)}.`,
    data: {
      payment: { id: payment.id, status: 'refunded', refundId: refund.id },
      subscription: subscription ? { id: subscription.id, status: subscription.status } : null
    }
  };
};

/**
 * Create upgrade/downgrade payment intent
 * @param {Object} data - Upgrade payment data
 * @returns {Object} Payment intent with client secret
 */
exports.createUpgradePaymentIntent = async (data) => {
  try {
    console.log('createUpgradePaymentIntent called with data:', data);
    
    const { planId, billingCycle, userId } = data;

    // Validate inputs
    if (!planId || !userId) {
      throw new Error('Plan ID and User ID are required');
    }
    
    console.log('Input validation passed:', { planId, billingCycle, userId });

    // Get plan details
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      throw new Error('Invalid plan ID');
    }
    
    console.log('Plan found:', { planId: plan.id, planName: plan.name, planPrice: plan.price, planYearlyPrice: plan.yearly_price });

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }

    // Get current subscription automatically
    const currentSubscription = await Subscription.findOne({
      where: { 
        owner_id: userId,
        status: 'active'
      }
    });

    if (!currentSubscription) {
      throw new Error('No active subscription found. Please subscribe to a plan first.');
    }
    
    console.log('Current subscription found:', { 
      subscriptionId: currentSubscription.id, 
      planId: currentSubscription.planId,
      status: currentSubscription.status 
    });

    // Get current plan to determine if this is an upgrade or downgrade
    const currentPlan = await SubscriptionPlan.findByPk(currentSubscription.planId);
    if (!currentPlan) {
      throw new Error('Current subscription plan not found');
    }
    
    console.log('Current plan found:', { 
      planId: currentPlan.id, 
      planName: currentPlan.name, 
      planPrice: currentPlan.price, 
      planYearlyPrice: currentPlan.yearly_price 
    });
    
    // Validate plan has pricing information
    if (!currentPlan.price && !currentPlan.yearly_price) {
      throw new Error('Current plan has no pricing information');
    }
    
    if (!plan.price && !plan.yearly_price) {
      throw new Error('New plan has no pricing information');
    }

    // Automatically determine if this is an upgrade or downgrade
    const currentAmount = currentPlan.price || 0;
    const newAmount = billingCycle === 'yearly' ? (plan.yearly_price || plan.price) : (plan.price || 0);
    
    console.log('Price comparison:', {
      currentAmount,
      newAmount,
      billingCycle,
      currentPlanPrice: currentPlan.price,
      newPlanPrice: plan.price,
      newPlanYearlyPrice: plan.yearly_price
    });
    
    // Define upgradeType variable
    const upgradeType = newAmount > currentAmount ? 'upgrade' : 'downgrade';
    
    console.log('Upgrade detection:', {
      currentPlanPrice: currentAmount,
      newPlanPrice: newAmount,
      upgradeType: upgradeType
    });

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

    // Create upgrade payment record
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
        billing_cycle: billingCycle,
        upgrade_type: upgradeType,
        current_subscription_id: currentSubscription.id,
        is_upgrade: upgradeType === 'upgrade'
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
        billing_cycle: billingCycle,
        upgrade_type: upgradeType,
        current_subscription_id: currentSubscription.id
      },
      description: `Subscription ${upgradeType} payment for ${plan.name} plan - ${user.name || user.email}`,
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
      upgradeType: upgradeType,
      currentSubscriptionId: currentSubscription.id,
      expiresAt: subscriptionPayment.expires_at
    };
  } catch (error) {
    console.error('Error in createUpgradePaymentIntent:', error);
    throw error;
  }
};

/**
 * Create downgrade payment intent
 * @param {Object} data - Downgrade payment data
 * @returns {Object} Payment intent with client secret
 */
exports.createDowngradePaymentIntent = async (data) => {
  try {
    console.log('createDowngradePaymentIntent called with data:', data);
    
    const { planId, billingCycle, userId } = data;

    // Validate inputs
    if (!planId || !userId) {
      throw new Error('Plan ID and User ID are required');
    }
    
    console.log('Input validation passed:', { planId, billingCycle, userId });

    // Get plan details
    const plan = await SubscriptionPlan.findByPk(planId);
    if (!plan) {
      throw new Error('Invalid plan ID');
    }
    
    console.log('Plan found:', { planId: plan.id, planName: plan.name, planPrice: plan.price, planYearlyPrice: plan.yearly_price });

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Invalid user ID');
    }

    // Get current subscription automatically
    const currentSubscription = await Subscription.findOne({
      where: { 
        owner_id: userId,
        status: 'active'
      }
    });

    if (!currentSubscription) {
      throw new Error('No active subscription found. Please subscribe to a plan first.');
    }
    
    console.log('Current subscription found:', { 
      subscriptionId: currentSubscription.id, 
      planId: currentSubscription.planId,
      status: currentSubscription.status 
    });

    // Get current plan to determine if this is actually a downgrade
    const currentPlan = await SubscriptionPlan.findByPk(currentSubscription.planId);
    if (!currentPlan) {
      throw new Error('Current subscription plan not found');
    }
    
    console.log('Current plan found:', { 
      planId: currentPlan.id, 
      planName: currentPlan.name, 
      planPrice: currentPlan.price, 
      planYearlyPrice: currentPlan.yearly_price 
    });
    
    // Validate plan has pricing information
    if (!currentPlan.price && !currentPlan.yearly_price) {
      throw new Error('Current plan has no pricing information');
    }
    
    if (!plan.price && !plan.yearly_price) {
      throw new Error('New plan has no pricing information');
    }

    // Verify this is actually a downgrade
    const currentAmount = currentPlan.price || 0;
    const newAmount = billingCycle === 'yearly' ? (plan.yearly_price || plan.price) : (plan.price || 0);
    
    console.log('Price comparison:', {
      currentAmount,
      newAmount,
      billingCycle,
      currentPlanPrice: currentPlan.price,
      newPlanPrice: plan.price,
      newPlanYearlyPrice: plan.yearly_price
    });
    
    // Ensure this is actually a downgrade
    if (newAmount >= currentAmount) {
      throw new Error('This is not a downgrade. The selected plan has the same or higher price than your current plan.');
    }
    
    // Force upgradeType to be 'downgrade'
    const upgradeType = 'downgrade';
    
    console.log('Downgrade detection:', {
      currentPlanPrice: currentAmount,
      newPlanPrice: newAmount,
      upgradeType: upgradeType
    });

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

    // Create downgrade payment record
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
        billing_cycle: billingCycle,
        upgrade_type: upgradeType,
        current_subscription_id: currentSubscription.id,
        is_upgrade: false,
        is_downgrade: true
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
        billing_cycle: billingCycle,
        upgrade_type: upgradeType,
        current_subscription_id: currentSubscription.id
      },
      description: `Subscription ${upgradeType} payment for ${plan.name} plan - ${user.name || user.email}`,
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
      upgradeType: upgradeType,
      currentSubscriptionId: currentSubscription.id,
      expiresAt: subscriptionPayment.expires_at
    };
  } catch (error) {
    console.error('Error in createDowngradePaymentIntent:', error);
    throw error;
  }
};

/**
 * Handle upgrade/downgrade payment after successful payment
 * @param {Object} payment - Payment object
 * @returns {Object} Updated subscription
 */
exports.handleUpgradePayment = async (payment) => {
  const { upgrade_type, current_subscription_id } = payment.metadata;
  
  // Use transaction to ensure data consistency
  const result = await SubscriptionPayment.sequelize.transaction(async (t) => {
    // Update payment status
    await payment.update({
      status: 'paid',
      payment_date: new Date()
    }, { transaction: t });

    // Get current subscription
    const currentSubscription = await Subscription.findByPk(current_subscription_id, { transaction: t });
    if (!currentSubscription) {
      throw new Error('Current subscription not found');
    }

    // Get new plan details
    const newPlan = await SubscriptionPlan.findByPk(payment.plan_id, { transaction: t });
    if (!newPlan) {
      throw new Error('New plan not found');
    }

    // Get owner details
    const owner = await User.findByPk(payment.owner_id, { transaction: t });

    // Calculate new billing dates
    const startDate = new Date();
    const nextBillingDate = new Date(startDate);
    
    if (payment.billing_cycle === 'yearly') {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    // Update existing subscription with new plan details
    const updatedSubscription = await currentSubscription.update({
      planId: payment.plan_id,
      amount: payment.amount,
      billingCycle: payment.billing_cycle,
      nextBillingDate: nextBillingDate,
      // Keep existing usage but update limits based on new plan
      usage: {
        ...currentSubscription.usage,
        bookingsLimit: newPlan.limits?.bookings || currentSubscription.usage?.bookingsLimit || 0,
        staffLimit: newPlan.limits?.staff || currentSubscription.usage?.staffLimit || 0,
        locationsLimit: newPlan.limits?.locations || currentSubscription.usage?.locationsLimit || 1,
      }
    }, { transaction: t });

    // Create billing history record for upgrade/downgrade
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    await BillingHistory.create({
      subscription_id: updatedSubscription.id,
      date: new Date(),
      amount: payment.amount,
      status: 'paid',
      description: `Subscription ${upgrade_type} payment for ${newPlan.name} plan - ${payment.billing_cycle}`,
      transaction_id: `TXN-${payment.id.slice(0, 8).toUpperCase()}`,
      invoice_number: invoiceNumber,
      subtotal: payment.amount,
      total: payment.amount,
      tax_amount: 0
    }, { transaction: t });

    return { subscription: updatedSubscription, payment, plan: newPlan, owner, invoiceNumber };
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
      console.log(`${result.payment.metadata.upgrade_type} invoice email sent successfully to ${result.owner.email} for payment ${result.payment.id}`);
    } else {
      console.error(`Failed to send ${result.payment.metadata.upgrade_type} invoice email to ${result.owner.email} for payment ${result.payment.id}`);
    }
  } catch (emailError) {
    console.error('Error sending upgrade invoice email:', emailError);
    // Don't fail the upgrade process if email fails
  }

  return result.subscription;
};
