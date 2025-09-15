const subscriptionPaymentService = require('../services/subscriptionPaymentService');
const { IntegrationSettings } = require('../models');

/**
 * Create a subscription payment intent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { planId, billingCycle, userId } = req.body;

    // Validate required fields
    if (!planId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and User ID are required'
      });
    }

    // Create payment intent
    const paymentIntent = await subscriptionPaymentService.createSubscriptionPaymentIntent({
      planId,
      billingCycle: billingCycle || 'monthly',
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Payment intent created successfully',
      data: paymentIntent
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    next(error);
  }
};

/**
 * Get subscription payment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getPaymentById = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { userId } = req.body; // Assuming user ID is passed in body for admin access

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await subscriptionPaymentService.getSubscriptionPaymentById(paymentId, userId);

    res.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Error getting payment:', error);
    next(error);
  }
};

/**
 * Get subscription payments for an owner
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getPaymentsByOwnerId = async (req, res, next) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    const payments = await subscriptionPaymentService.getSubscriptionPaymentsByOwnerId(ownerId);

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('Error getting payments by owner:', error);
    next(error);
  }
};

/**
 * Cancel a subscription payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.cancelPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { userId } = req.body;

    if (!paymentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID and User ID are required'
      });
    }

    const cancelledPayment = await subscriptionPaymentService.cancelSubscriptionPayment(paymentId, userId);

    res.json({
      success: true,
      message: 'Payment cancelled successfully',
      data: cancelledPayment
    });

  } catch (error) {
    console.error('Error cancelling payment:', error);
    next(error);
  }
};

/**
 * Send invoice email for a payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.sendInvoiceEmail = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { userId } = req.body;

    if (!paymentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID and User ID are required'
      });
    }

    const result = await subscriptionPaymentService.sendInvoiceEmailForPayment(paymentId, userId);

    res.json({
      success: result.success,
      message: result.message,
      data: {
        email: result.email,
        paymentId: result.paymentId
      }
    });

  } catch (error) {
    console.error('Error sending invoice email:', error);
    next(error);
  }
};

/**
 * Refund a subscription payment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { userId, refundReason } = req.body;

    if (!paymentId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID and User ID are required'
      });
    }

    const result = await subscriptionPaymentService.refundSubscriptionPayment(
      paymentId, 
      userId, 
      refundReason
    );

    res.json({
      success: result.success,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error('Error refunding payment:', error);
    next(error);
  }
};

/**
 * Create upgrade payment intent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createUpgradePaymentIntent = async (req, res, next) => {
  try {
    console.log('createUpgradePaymentIntent received body:', req.body);
    const { planId, billingCycle, userId } = req.body;

    console.log('Extracted values:', { planId, billingCycle, userId });
    console.log('planId type:', typeof planId);
    console.log('userId type:', typeof userId);

    if (!planId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and User ID are required'
      });
    }

    const paymentIntent = await subscriptionPaymentService.createUpgradePaymentIntent({
      planId,
      billingCycle: billingCycle || 'monthly',
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Upgrade payment intent created successfully',
      data: paymentIntent
    });

  } catch (error) {
    console.error('Error creating upgrade payment intent:', error);
    next(error);
  }
};

/**
 * Create downgrade payment intent
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.createDowngradePaymentIntent = async (req, res, next) => {
  try {
    console.log('createDowngradePaymentIntent received body:', req.body);
    const { planId, billingCycle, userId } = req.body;

    console.log('Extracted values:', { planId, billingCycle, userId });
    console.log('planId type:', typeof planId);
    console.log('userId type:', typeof userId);

    if (!planId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and User ID are required'
      });
    }

    const paymentIntent = await subscriptionPaymentService.createDowngradePaymentIntent({
      planId,
      billingCycle: billingCycle || 'monthly',
      userId
    });

    res.status(201).json({
      success: true,
      message: 'Downgrade payment intent created successfully',
      data: paymentIntent
    });

  } catch (error) {
    console.error('Error creating downgrade payment intent:', error);
    next(error);
  }
};

/**
 * Get Stripe publishable key for frontend
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.getStripePublishableKey = async (req, res, next) => {
  try {
    const settings = await IntegrationSettings.findOne({
      where: { stripe_enabled: true }
    });

    if (!settings || !settings.stripe_publishable_key) {
      return res.status(404).json({
        success: false,
        message: 'Stripe publishable key not configured'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        publishableKey: settings.stripe_publishable_key
      }
    });
  } catch (error) {
    console.error('Error fetching Stripe publishable key:', error);
    next(error);
  }
};

/**
 * Test endpoint to manually trigger subscription activation
 * This is for testing purposes only - remove in production
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.testActivateSubscription = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentIntentId is required'
      });
    }

    console.log(`Manually triggering subscription activation for payment intent: ${paymentIntentId}`);
    
    const subscriptionPaymentService = require('../services/subscriptionPaymentService');
    const result = await subscriptionPaymentService.handleSuccessfulSubscriptionPayment(paymentIntentId);
    
    res.status(200).json({
      success: true,
      message: 'Subscription activated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in test subscription activation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to activate subscription'
    });
  }
};
