const express = require('express');
const router = express.Router();
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const salonSubscriptionController = require('../../../../controllers/Api/salon/salonSubscriptionController');
const subscriptionPaymentController = require('../../../../controllers/Api/salon/subscriptionPaymentController');
const { createSubscriptionValidation, createPaymentIntentValidation } = require('../../../../validation/subscriptionValidation');
const validate = require('../../../../middleware/validate');

// Get all available subscription plans
router.get('/plans', authenticateOwner, salonSubscriptionController.getSubscriptionPlans);

// Get subscription plan by ID
router.get('/plans/:id', authenticateOwner, salonSubscriptionController.getSubscriptionPlanById);

// Get current salon subscription
router.get('/current/salon/:salonId', authenticateOwner, salonSubscriptionController.getCurrentSubscription);

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
  createSubscriptionValidation,
  validate,
  salonSubscriptionController.upgradeSubscription
);

// Downgrade subscription (end of cycle activation)
router.post('/downgrade', 
  authenticateOwner, 
  createSubscriptionValidation,
  validate,
  salonSubscriptionController.downgradeSubscription
);

// Cancel subscription
router.post('/cancel', authenticateOwner, salonSubscriptionController.cancelSubscription);

// Get subscription usage
router.get('/usage/salon/:salonId', authenticateOwner, salonSubscriptionController.getSubscriptionUsage);

// Get billing history
router.get('/billing-history/salon/:salonId', authenticateOwner, salonSubscriptionController.getBillingHistory);

// ===== SUBSCRIPTION PAYMENT ENDPOINTS =====

// Create subscription payment intent
router.post('/payment/create-payment',
  authenticateOwner,
  createPaymentIntentValidation,
  validate,
  subscriptionPaymentController.createSubscriptionPaymentIntent
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

module.exports = router;
