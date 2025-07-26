const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const {
  authenticateToken,
  authorize,
  blockUserDashboard,
} = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

// GET dashboard stats - admin only
router.get(
  "/stats",
  checkPermission("analytics", "view"),
  dashboardController.getDashboardStats
);

module.exports = router;
