const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protect all routes
router.use(authenticateToken);

// GET all payments
router.get('/', paymentController.getAllPayments);

// GET payment by ID
router.get('/:id', paymentController.getPaymentById);

// POST a new payment
router.post('/', paymentController.createPayment);

// PUT (update) a payment by ID
router.put('/:id', paymentController.updatePayment);

// DELETE a payment by ID
router.delete('/:id', paymentController.deletePayment);

module.exports = router; 