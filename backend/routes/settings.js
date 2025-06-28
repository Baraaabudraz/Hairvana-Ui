const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// User settings routes
router.get('/', settingsController.getUserSettings);
router.put('/profile', settingsController.updateProfileSettings);
router.put('/security', settingsController.updateSecuritySettings);
router.put('/notifications', settingsController.updateNotificationPreferences);
router.put('/billing', settingsController.updateBillingSettings);
router.put('/backup', settingsController.updateBackupSettings);

// Platform settings routes (admin only)
router.get('/platform', authorize('admin', 'super_admin'), settingsController.getPlatformSettings);
router.put('/platform', authorize('admin', 'super_admin'), settingsController.updatePlatformSettings);

// Integration settings routes (admin only)
router.get('/integrations', authorize('admin', 'super_admin'), settingsController.getIntegrationSettings);
router.put('/integrations', authorize('admin', 'super_admin'), settingsController.updateIntegrationSettings);

module.exports = router;