const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const {
  authenticateToken,
  authorize,
} = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Protect all routes
router.use(authenticateToken);

// GET analytics data - admin only
router.get(
  "/",
  checkPermission("analytics", "view"),
  analyticsController.getAnalytics
);

// POST generate report - admin only
router.post(
  "/reports/generate",
  checkPermission("analytics", "view"),
  analyticsController.generateReport
);

module.exports = router;
