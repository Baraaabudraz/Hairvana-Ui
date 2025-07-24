const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { validateReport, validateGenerateReport } = require('../validation/reportValidation');

// Protect all routes
router.use(authenticateToken);

router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReportById);
router.post('/', validateReport, validate, reportController.createReport);
router.post('/generate', authorize('admin', 'super_admin'), validateGenerateReport, validate, reportController.generateReport);
router.put('/:id', validateReport, validate, reportController.updateReport);
router.delete('/:id', reportController.deleteReport);

module.exports = router; 