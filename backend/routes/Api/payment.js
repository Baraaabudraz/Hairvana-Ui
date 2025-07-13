const express = require('express');
const router = express.Router();
const mobilePaymentController = require('../../controllers/Api/mobilePaymentController');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Raw body middleware for Stripe webhook signature verification
const rawBodyMiddleware = express.raw({ type: 'application/json' });

// POST /webhook — Stripe webhook handler (no auth required, raw body needed)
router.post('/webhook', rawBodyMiddleware, mobilePaymentController.stripeWebhook);

// Protect all other routes
router.use(authenticateToken);

// GET all payments for the authenticated user
router.get('/', mobilePaymentController.getUserPayments);

// GET /history — User's payment history
router.get('/history', mobilePaymentController.getUserPaymentHistory);

// GET a payment by ID (only if it belongs to the user)
router.get('/:id', mobilePaymentController.getUserPaymentById);

// POST a new payment (for user's own appointment)
router.post('/', mobilePaymentController.createUserPayment);

// POST /checkout — Initiate payment for an appointment
router.post('/checkout', mobilePaymentController.checkoutPayment);

module.exports = router; 