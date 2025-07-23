const express = require('express');
const router = express.Router();
const reportTemplateController = require('../controllers/reportTemplateController');
const { validate } = require('../middleware/validationMiddleware');
const { validateReportTemplate } = require('../validation/reportValidation');

router.get('/', reportTemplateController.getAllReportTemplates);
router.get('/:id', reportTemplateController.getReportTemplateById);
router.post('/', validateReportTemplate, validate, reportTemplateController.createReportTemplate);
router.put('/:id', validateReportTemplate, validate, reportTemplateController.updateReportTemplate);
router.delete('/:id', reportTemplateController.deleteReportTemplate);

module.exports = router; 