const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const {
  authenticateToken,
  authorize,
  blockUserDashboard,
} = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const { validate } = require('../middleware/validationMiddleware');
const { validateReport, validateGenerateReport } = require('../validation/reportValidation');

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

router.get(
  "/",
  checkPermission("reports", "view"),
  reportController.getAllReports
);
router.get("/:id", reportController.getReportById);
router.post("/", validateReport, validate, reportController.createReport);
router.post(
  "/generate",
  authorize("admin", "super admin"),
  validateGenerateReport, validate, reportController.generateReport
);
router.put("/:id", validateReport, validate, reportController.updateReport);
router.delete(
  "/:id",
  checkPermission("reports", "delete"),
  reportController.deleteReport
);

module.exports = router;
