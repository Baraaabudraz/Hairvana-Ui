const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const {
  authenticateToken,
  authorize,
  blockUserDashboard,
} = require("../middleware/authMiddleware");

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

// GET dashboard stats - admin only
router.get(
  "/stats",
  authorize("admin", "super_admin"),
  dashboardController.getDashboardStats
);

module.exports = router;
