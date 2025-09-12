const express = require('express');
const router = express.Router();
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const salonSubscriptionController = require('../../../../controllers/Api/salon/salonSubscriptionController');
const subscriptionPaymentController = require('../../../../controllers/Api/salon/subscriptionPaymentController');
const { createSubscriptionValidation, updateSubscriptionValidation, createPaymentIntentValidation } = require('../../../../validation/subscriptionValidation');
const validate = require('../../../../middleware/validate');

// Get all available subscription plans
router.get('/plans', authenticateOwner, salonSubscriptionController.getSubscriptionPlans);

// Get subscription plan by ID
router.get('/plans/:id', authenticateOwner, salonSubscriptionController.getSubscriptionPlanById);

// Get current owner subscription (not tied to specific salon)
router.get('/current', authenticateOwner, salonSubscriptionController.getCurrentSubscription);

// Subscribe to a plan
router.post('/subscribe', 
  authenticateOwner, 
  createSubscriptionValidation,
  validate,
  salonSubscriptionController.subscribeToPlan
);

// Upgrade subscription (immediate activation)
router.post('/upgrade', 
  authenticateOwner, 
  updateSubscriptionValidation,
  validate,
  salonSubscriptionController.upgradeSubscription
);

// Downgrade subscription (end of cycle activation)
router.post('/downgrade', 
  authenticateOwner, 
  updateSubscriptionValidation,
  validate,
  salonSubscriptionController.downgradeSubscription
);

// Cancel subscription
router.post('/cancel', authenticateOwner, salonSubscriptionController.cancelSubscription);

// Get subscription usage for owner (not tied to specific salon)
router.get('/usage', authenticateOwner, salonSubscriptionController.getSubscriptionUsage);

// Get billing history for owner (not tied to specific salon)
router.get('/billing-history', authenticateOwner, salonSubscriptionController.getBillingHistory);

// Get subscription info including features and limits
router.get('/info', authenticateOwner, salonSubscriptionController.getSubscriptionInfo);

// ===== SUBSCRIPTION PAYMENT ENDPOINTS =====

// Create subscription payment intent
router.post('/payment/create-payment',
  authenticateOwner,
  createPaymentIntentValidation,
  validate,
  subscriptionPaymentController.createSubscriptionPaymentIntent
);

// Create upgrade payment intent
router.post('/payment/create-upgrade-intent',
  authenticateOwner,
  createPaymentIntentValidation,
  validate,
  subscriptionPaymentController.createUpgradePaymentIntent
);

// Create downgrade payment intent
router.post('/payment/create-downgrade-intent',
  authenticateOwner,
  createPaymentIntentValidation,
  validate,
  subscriptionPaymentController.createDowngradePaymentIntent
);

// Get subscription payment by ID
router.get('/payment/:paymentId',
  authenticateOwner,
  subscriptionPaymentController.getSubscriptionPaymentById
);

// Get subscription payments for the authenticated owner
router.get('/payment/owner',
  authenticateOwner,
  subscriptionPaymentController.getSubscriptionPaymentsByOwnerId
);

// Cancel subscription payment
router.post('/payment/:paymentId/cancel',
  authenticateOwner,
  subscriptionPaymentController.cancelSubscriptionPayment
);

// Check payment status
router.get('/payment/:paymentId/status',
  authenticateOwner,
  subscriptionPaymentController.checkPaymentStatus
);

// Send invoice email for a payment
router.post('/payment/:paymentId/send-invoice',
  authenticateOwner,
  subscriptionPaymentController.sendInvoiceEmail
);

// Refund a payment (separate from cancellation)
router.post('/payment/:paymentId/refund',
  authenticateOwner,
  subscriptionPaymentController.refundSubscriptionPayment
);

// Backfill billing history for all existing payments
router.post('/payment/backfill-billing-history',
  authenticateOwner,
  subscriptionPaymentController.backfillBillingHistory
);

module.exports = router;
