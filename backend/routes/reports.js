const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const {
  authenticateToken,
  authorize,
  blockUserDashboard,
} = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

router.get(
  "/",
  checkPermission("reports", "view"),
  reportController.getAllReports
);
router.get("/:id", reportController.getReportById);
router.post("/", reportController.createReport);
router.post(
  "/generate",
  authorize("admin", "super_admin"),
  reportController.generateReport
);
router.put("/:id", reportController.updateReport);
router.delete(
  "/:id",
  checkPermission("reports", "delete"),
  reportController.deleteReport
);

module.exports = router;
