const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticateToken } = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Protect all routes
router.use(authenticateToken);

// GET all payments
router.get(
  "/",
  checkPermission("billing", "view"),
  paymentController.getAllPayments
);

// GET payment by ID
router.get(
  "/:id",
  checkPermission("billing", "view"),
  paymentController.getPaymentById
);

// POST a new payment
router.post(
  "/",
  checkPermission("billing", "add"),
  paymentController.createPayment
);

// PUT (update) a payment by ID
router.put(
  "/:id",
  checkPermission("billing", "edit"),
  paymentController.updatePayment
);

// DELETE a payment by ID
router.delete(
  "/:id",
  checkPermission("billing", "delete"),
  paymentController.deletePayment
);

module.exports = router;
