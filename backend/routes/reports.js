const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const {
  authenticateToken,
  authorize,
  authorizeNoDelete,
  blockUserDashboard,
} = require("../middleware/authMiddleware");

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

router.get("/", reportController.getAllReports);
router.get("/:id", reportController.getReportById);
router.post("/", reportController.createReport);
router.post(
  "/generate",
  authorize("admin", "super_admin"),
  reportController.generateReport
);
router.put("/:id", reportController.updateReport);
router.delete("/:id", authorizeNoDelete(), reportController.deleteReport);

module.exports = router;
