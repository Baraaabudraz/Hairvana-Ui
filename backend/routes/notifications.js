const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { createNotificationValidation } = require('../validation/notificationValidation');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// GET all notifications - admin only
router.get('/', authorize('admin', 'super_admin'), notificationController.getAllNotifications);

// POST a new notification with validation - admin only
router.post('/', authorize('admin', 'super_admin'), createNotificationValidation, validate, notificationController.createNotification);

// GET notification templates - admin only
router.get('/templates', authorize('admin', 'super_admin'), notificationController.getNotificationTemplates);

// DELETE a notification - admin only
router.delete('/:id', authorize('admin', 'super_admin'), notificationController.deleteNotification);

// POST send a notification - admin only
router.post('/:id/send', authorize('admin', 'super_admin'), notificationController.sendNotification);

module.exports = router;