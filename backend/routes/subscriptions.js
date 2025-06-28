const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// GET all subscriptions
router.get('/', subscriptionController.getAllSubscriptions);

// GET subscription by ID
router.get('/:id', subscriptionController.getSubscriptionById);

// POST a new subscription
router.post('/', subscriptionController.createSubscription);

// PUT (update) a subscription by ID
router.put('/:id', subscriptionController.updateSubscription);

// PATCH cancel a subscription
router.patch('/:id/cancel', subscriptionController.cancelSubscription);

// GET subscription plans
router.get('/plans', subscriptionController.getSubscriptionPlans);

// POST create a billing record
router.post('/billing', subscriptionController.createBillingRecord);

// POST sync billing data
router.post('/:id/sync', subscriptionController.syncBilling);

// POST generate report
router.post('/:id/report', subscriptionController.generateReport);

// GET export invoices
router.get('/:id/export', subscriptionController.exportInvoices);

// PUT update payment method
router.put('/:id/payment', subscriptionController.updatePaymentMethod);

module.exports = router;