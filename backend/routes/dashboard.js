const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// GET dashboard stats - admin only
router.get('/stats', authorize('admin', 'super_admin'), dashboardController.getDashboardStats);

module.exports = router;