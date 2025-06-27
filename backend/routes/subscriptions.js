const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { createSubscriptionValidation, updateSubscriptionValidation } = require('../validation/subscriptionValidation');
const { validate } = require('../middleware/validationMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// GET all subscriptions
router.get('/', subscriptionController.getAllSubscriptions);

// GET subscription by ID
router.get('/:id', subscriptionController.getSubscriptionById);

// POST a new subscription with validation
router.post('/', createSubscriptionValidation, validate, subscriptionController.createSubscription);

// PUT (update) a subscription by ID with validation
router.put('/:id', updateSubscriptionValidation, validate, subscriptionController.updateSubscription);

// PATCH cancel a subscription
router.patch('/:id/cancel', subscriptionController.cancelSubscription);

// GET subscription plans
router.get('/plans', subscriptionController.getSubscriptionPlans);

// POST create a billing record
router.post('/billing', subscriptionController.createBillingRecord);

module.exports = router;