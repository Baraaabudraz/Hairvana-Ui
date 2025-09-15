const express = require('express');
const router = express.Router();
const subscriptionPaymentController = require('../controllers/subscriptionPaymentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/permissionMiddleware');
const {
  createSubscriptionPaymentIntentValidation,
  createUpgradeDowngradePaymentIntentValidation,
  refundPaymentValidation
} = require('../validation/subscriptionPaymentValidation');
const { validate } = require('../middleware/validationMiddleware');

// GET Stripe publishable key (public endpoint, no auth required)
router.get('/stripe-key', subscriptionPaymentController.getStripePublishableKey);

// TEST endpoint to manually activate subscription (for testing only)
router.post('/test-activate', subscriptionPaymentController.testActivateSubscription);

/**
 * POST /api/subscription-payments/create-intent
 * Create a new subscription payment intent
 */
router.post(
  '/create-intent',
  authenticateToken,
  checkPermission('subscriptions', 'add'),
  createSubscriptionPaymentIntentValidation,
  validate,
  subscriptionPaymentController.createPaymentIntent
);

/**
 * GET /api/subscription-payments/:paymentId
 * Get subscription payment by ID
 */
router.get(
  '/:paymentId',
  authenticateToken,
  checkPermission('subscriptions', 'view'),
  subscriptionPaymentController.getPaymentById
);

/**
 * GET /api/subscription-payments/owner/:ownerId
 * Get subscription payments for an owner
 */
router.get(
  '/owner/:ownerId',
  authenticateToken,
  checkPermission('subscriptions', 'view'),
  subscriptionPaymentController.getPaymentsByOwnerId
);

/**
 * POST /api/subscription-payments/:paymentId/cancel
 * Cancel a subscription payment
 */
router.post(
  '/:paymentId/cancel',
  authenticateToken,
  checkPermission('subscriptions', 'edit'),
  subscriptionPaymentController.cancelPayment
);

/**
 * POST /api/subscription-payments/:paymentId/send-invoice
 * Send invoice email for a payment
 */
router.post(
  '/:paymentId/send-invoice',
  authenticateToken,
  checkPermission('subscriptions', 'edit'),
  subscriptionPaymentController.sendInvoiceEmail
);

/**
 * POST /api/subscription-payments/:paymentId/refund
 * Refund a subscription payment
 */
router.post(
  '/:paymentId/refund',
  authenticateToken,
  checkPermission('subscriptions', 'edit'),
  refundPaymentValidation,
  validate,
  subscriptionPaymentController.refundPayment
);

/**
 * POST /api/subscription-payments/upgrade/create-intent
 * Create upgrade payment intent
 */
router.post(
  '/upgrade/create-intent',
  authenticateToken,
  checkPermission('subscriptions', 'edit'),
  createUpgradeDowngradePaymentIntentValidation,
  validate,
  subscriptionPaymentController.createUpgradePaymentIntent
);

/**
 * POST /api/subscription-payments/downgrade/create-intent
 * Create downgrade payment intent
 */
router.post(
  '/downgrade/create-intent',
  authenticateToken,
  checkPermission('subscriptions', 'edit'),
  createUpgradeDowngradePaymentIntentValidation,
  validate,
  subscriptionPaymentController.createDowngradePaymentIntent
);

module.exports = router;
