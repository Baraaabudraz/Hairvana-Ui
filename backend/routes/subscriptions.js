const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const {
  authenticateToken,
  blockUserDashboard,
} = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const {
  createSubscriptionValidation,
  updateSubscriptionValidation,
  createBillingRecordValidation,
} = require("../validation/subscriptionValidation");
const { validationResult } = require("express-validator");

// Helper middleware to handle validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

// Block salon owners from all plan/subscription routes
function blockSalonOwner(req, res, next) {
  if (req.user && req.user.role === "salon") {
    return res.status(403).json({
      message: "Salon owners are not allowed to access this resource.",
    });
  }
  next();
}

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

// --- PLAN ROUTES ---
router.get("/plans", subscriptionController.getPlans);
router.get("/plans/:id", subscriptionController.getPlanById);
router.post("/plans", subscriptionController.createPlan);
router.put("/plans/:id", subscriptionController.updatePlan);
// DELETE a plan
router.delete(
  "/plans/:id",
  checkPermission("subscriptions", "delete"),
  subscriptionController.deletePlan
);

// GET all subscriptions
router.get(
  "/",
  checkPermission("subscriptions", "view"),
  subscriptionController.getAllSubscriptions
);

// GET subscription by ID
router.get("/:id", subscriptionController.getSubscriptionById);

// POST a new subscription
router.post(
  "/",
  createSubscriptionValidation,
  handleValidationErrors,
  checkPermission("subscriptions", "add"),
  subscriptionController.createSubscription
);

// PUT (update) a subscription by ID
router.put(
  "/:id",
  updateSubscriptionValidation,
  handleValidationErrors,
  checkPermission("subscriptions", "edit"),
  subscriptionController.updateSubscription
);

// PATCH cancel a subscription
router.patch(
  "/:id/cancel",
  checkPermission("subscriptions", "edit"),
  subscriptionController.cancelSubscription
);

// POST create a billing record
router.post(
  "/billing",
  checkPermission("subscriptions", "edit"),
  createBillingRecordValidation,
  handleValidationErrors,
  subscriptionController.createBillingRecord
);

// POST sync billing data
router.post(
  "/:id/sync",
  checkPermission("subscriptions", "edit"),
  subscriptionController.syncBilling
);

// POST generate report
router.post(
  "/:id/report",
  checkPermission("subscriptions", "view"),
  subscriptionController.generateReport
);

// GET export invoices
router.get(
  "/:id/export",
  checkPermission("subscriptions", "view"),
  subscriptionController.exportInvoices
);

// PUT update payment method
router.put(
  "/:id/payment",
  checkPermission("subscriptions", "edit"),
  subscriptionController.updatePaymentMethod
);

module.exports = router;
