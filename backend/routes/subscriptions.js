const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const {
  authenticateToken,
  authorize,
  authorizeNoDelete,
  blockUserDashboard,
} = require("../middleware/authMiddleware");
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
    return res
      .status(403)
      .json({
        message: "Salon owners are not allowed to access this resource.",
      });
  }
  next();
}

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());
router.use(blockSalonOwner);

// --- PLAN ROUTES ---
router.get("/plans", subscriptionController.getPlans);
router.get("/plans/:id", subscriptionController.getPlanById);
router.post("/plans", subscriptionController.createPlan);
router.put("/plans/:id", subscriptionController.updatePlan);
router.delete(
  "/plans/:id",
  authorizeNoDelete(),
  subscriptionController.deletePlan
);

// GET all subscriptions
router.get("/", subscriptionController.getAllSubscriptions);

// GET subscription by ID
router.get("/:id", subscriptionController.getSubscriptionById);

// POST a new subscription
router.post(
  "/",
  createSubscriptionValidation,
  handleValidationErrors,
  subscriptionController.createSubscription
);

// PUT (update) a subscription by ID
router.put(
  "/:id",
  updateSubscriptionValidation,
  handleValidationErrors,
  subscriptionController.updateSubscription
);

// PATCH cancel a subscription
router.patch("/:id/cancel", subscriptionController.cancelSubscription);

// POST create a billing record
router.post(
  "/billing",
  createBillingRecordValidation,
  handleValidationErrors,
  subscriptionController.createBillingRecord
);

// POST sync billing data
router.post("/:id/sync", subscriptionController.syncBilling);

// POST generate report
router.post("/:id/report", subscriptionController.generateReport);

// GET export invoices
router.get("/:id/export", subscriptionController.exportInvoices);

// PUT update payment method
router.put("/:id/payment", subscriptionController.updatePaymentMethod);

module.exports = router;
