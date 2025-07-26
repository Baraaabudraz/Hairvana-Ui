const express = require("express");
const router = express.Router();
const reportTemplateController = require("../controllers/reportTemplateController");
const checkPermission = require("../middleware/permissionMiddleware");
const { blockUserDashboard } = require("../middleware/authMiddleware");
const { validate } = require('../middleware/validationMiddleware');
const { validateReportTemplate } = require('../validation/reportValidation');

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


router.get('/', reportTemplateController.getAllReportTemplates);
router.get('/:id', reportTemplateController.getReportTemplateById);
router.post('/', validateReportTemplate, validate, reportTemplateController.createReportTemplate);
router.put('/:id', validateReportTemplate, validate, reportTemplateController.updateReportTemplate);
router.delete('/:id', reportTemplateController.deleteReportTemplate);

module.exports = router;
