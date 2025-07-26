const express = require("express");
const router = express.Router();
const billingHistoryController = require("../controllers/billingHistoryController");
const checkPermission = require("../middleware/permissionMiddleware");

// Create a new billing history (invoice)
router.get(
  "/",
  checkPermission("billing", "view"),
  billingHistoryController.getAllBillingHistories
);
router.post(
  "/",
  checkPermission("billing", "add"),
  billingHistoryController.createBillingHistory
);
router.put(
  "/:id",
  checkPermission("billing", "edit"),
  billingHistoryController.updateBillingHistory
);
router.delete(
  "/:id",
  checkPermission("billing", "delete"),
  billingHistoryController.deleteBillingHistory
);

module.exports = router;
