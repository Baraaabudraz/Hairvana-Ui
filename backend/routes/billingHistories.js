const express = require("express");
const router = express.Router();
const billingHistoryController = require("../controllers/billingHistoryController");
const { authenticateToken } = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const { validateBillingHistory, handleValidationErrors } = require("../validation/billingHistoryValidation");

// Create a new billing history (invoice)
router.get(
  "/",
  authenticateToken,
  checkPermission("billing", "view"),
  billingHistoryController.getAllBillingHistories
);
router.post(
  "/",
  authenticateToken,
  checkPermission("billing", "add"),
  validateBillingHistory(false),
  handleValidationErrors,
  billingHistoryController.createBillingHistory
);
router.put(
  "/:id",
  authenticateToken,
  checkPermission("billing", "edit"),
  validateBillingHistory(true),
  handleValidationErrors,
  billingHistoryController.updateBillingHistory
);
router.delete(
  "/:id",
  authenticateToken,
  checkPermission("billing", "delete"),
  billingHistoryController.deleteBillingHistory
);

module.exports = router;
