const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// GET analytics data - admin only
router.get('/', authorize('admin', 'super_admin'), analyticsController.getAnalytics);

// POST generate report - admin only
router.post('/reports/generate', authorize('admin', 'super_admin'), analyticsController.generateReport);

module.exports = router;