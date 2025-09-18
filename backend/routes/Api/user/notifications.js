const express = require('express');
const router = express.Router();
const userNotificationController = require('../../../controllers/Api/user/userNotificationController');
const { authenticateToken } = require('../../../middleware/authMiddleware');

// Protect all routes
router.use(authenticateToken);

// GET / — List user notifications
router.get('/', userNotificationController.getUserNotifications);

// GET /unread-count — Get count of unread notifications
router.get('/unread-count', userNotificationController.getUnreadCount);

// POST /:id/read — Mark a specific notification as read
router.post('/:id/read', userNotificationController.markNotificationAsRead);

// POST /mark-all-read — Mark all notifications as read
router.post('/mark-all-read', userNotificationController.markAllNotificationsAsRead);

module.exports = router;
