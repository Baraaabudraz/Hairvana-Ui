const subscriptionPaymentService = require('../../../services/subscriptionPaymentService');
const salonService = require('../../../services/salonService');

/**
 * Create subscription payment intent
 * POST /backend/api/v0/salon/subscription/payment/create-intent
 */
exports.createSubscriptionPaymentIntent = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;
    const userId = req.user.id;

    const paymentIntent = await subscriptionPaymentService.createSubscriptionPaymentIntent({
      planId,
      billingCycle: billingCycle || 'monthly',
      userId
    });

    return res.status(201).json({
      success: true,
      message: 'Payment intent created successfully. Complete payment to activate subscription.',
      data: paymentIntent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription payment by ID
 * GET /backend/api/v0/salon/subscription/payment/:paymentId
 */
exports.getSubscriptionPaymentById = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await subscriptionPaymentService.getSubscriptionPaymentById(paymentId, userId);

    return res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription payments for a salon
 * GET /backend/api/v0/salon/subscription/payment/salon/:salonId
 */
exports.getSubscriptionPaymentsByOwnerId = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const payments = await subscriptionPaymentService.getSubscriptionPaymentsByOwnerId(userId);

    return res.status(200).json({
      success: true,
      data: payments,
      total: payments.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel subscription payment
 * POST /backend/api/v0/salon/subscription/payment/:paymentId/cancel
 */
exports.cancelSubscriptionPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const cancelledPayment = await subscriptionPaymentService.cancelSubscriptionPayment(paymentId, userId);

    return res.status(200).json({
      success: true,
      message: 'Payment cancelled successfully',
      data: cancelledPayment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check payment status and get subscription if paid
 * GET /backend/api/v0/salon/subscription/payment/:paymentId/status
 */
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await subscriptionPaymentService.getSubscriptionPaymentById(paymentId, userId);

    let subscription = null;
    if (payment.status === 'paid') {
      try {
        subscription = await subscriptionPaymentService.getSubscriptionByPaymentId(paymentId);
      } catch (error) {
        // Subscription might not be created yet due to webhook delay
        console.log('Subscription not yet created for payment:', paymentId);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          billingCycle: payment.billing_cycle,
          createdAt: payment.created_at,
          expiresAt: payment.expires_at
        },
        subscription: subscription ? {
          id: subscription.id,
          status: subscription.status,
          startDate: subscription.startDate,
          nextBillingDate: subscription.nextBillingDate,
          usage: subscription.usage
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create upgrade/downgrade payment intent
 * POST /backend/api/v0/salon/subscription/payment/create-upgrade-intent
 */
exports.createUpgradePaymentIntent = async (req, res, next) => {
  try {
    const { 
      planId, 
      billingCycle
    } = req.body;
    const userId = req.user.id;

    const paymentIntent = await subscriptionPaymentService.createUpgradePaymentIntent({
      planId,
      billingCycle: billingCycle || 'monthly',
      userId
    });

    return res.status(201).json({
      success: true,
      message: `Payment intent created for ${paymentIntent.upgradeType}. Complete payment to ${paymentIntent.upgradeType} subscription.`,
      data: paymentIntent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create downgrade payment intent
 * POST /backend/api/v0/salon/subscription/payment/create-downgrade-intent
 */
exports.createDowngradePaymentIntent = async (req, res, next) => {
  try {
    const { 
      planId, 
      billingCycle
    } = req.body;
    const userId = req.user.id;

    const paymentIntent = await subscriptionPaymentService.createDowngradePaymentIntent({
      planId,
      billingCycle: billingCycle || 'monthly',
      userId
    });

    return res.status(201).json({
      success: true,
      message: `Payment intent created for ${paymentIntent.upgradeType}. Complete payment to ${paymentIntent.upgradeType} subscription.`,
      data: paymentIntent
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send invoice email for a payment
 * POST /backend/api/v0/salon/subscription/payment/:paymentId/send-invoice
 */
exports.sendInvoiceEmail = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const result = await subscriptionPaymentService.sendInvoiceEmailForPayment(paymentId, userId);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        email: result.email,
        paymentId: result.paymentId,
        sent: result.success
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Backfill billing history for all existing payments
 * POST /backend/api/v0/salon/subscription/payment/backfill-billing-history
 */
exports.backfillBillingHistory = async (req, res, next) => {
  try {
    const result = await subscriptionPaymentService.ensureBillingHistoryForAllPayments();

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        created: result.created,
        existing: result.existing,
        total: result.total
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refund a subscription payment (separate from cancellation)
 * POST /backend/api/v0/salon/subscription/payment/:paymentId/refund
 */
exports.refundSubscriptionPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const { refund_reason } = req.body || {};
    if (!refund_reason || !String(refund_reason).trim()) {
      return res.status(400).json({
        success: false,
        message: 'refund_reason is required',
      });
    }

    const result = await subscriptionPaymentService.refundSubscriptionPayment(paymentId, userId, String(refund_reason).trim());

    const statusCode = result.success ? 200 : 400;
    return res.status(statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};