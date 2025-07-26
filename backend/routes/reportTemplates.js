const express = require("express");
const router = express.Router();
const reportTemplateController = require("../controllers/reportTemplateController");
const checkPermission = require("../middleware/permissionMiddleware");
const { blockUserDashboard } = require("../middleware/authMiddleware");

router.use(blockUserDashboard());
router.get("/", reportTemplateController.getAllReportTemplates);
router.get("/:id", reportTemplateController.getReportTemplateById);
router.post("/", reportTemplateController.createReportTemplate);
router.put("/:id", reportTemplateController.updateReportTemplate);
router.delete(
  "/:id",
  checkPermission("report_templates", "delete"),
  reportTemplateController.deleteReportTemplate
);

module.exports = router;
