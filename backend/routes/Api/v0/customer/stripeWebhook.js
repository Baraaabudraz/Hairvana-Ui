const express = require('express');
const router = express.Router();
const mobilePaymentController = require('../../../../controllers/Api/customer/mobilePaymentController');

// Stripe webhook route (must use raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), mobilePaymentController.stripeWebhook);

module.exports = router; 