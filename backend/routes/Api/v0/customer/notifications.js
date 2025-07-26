const express = require('express');
const router = express.Router();
const mobileNotificationController = require('../../../../controllers/Api/customer/mobileNotificationController');
const { authenticateCustomer } = require('../../../../middleware/authMiddleware');

// Protect all routes
router.use(authenticateCustomer);

// GET / — List user notifications
router.get('/', mobileNotificationController.getUserNotifications);

// POST /mark-read — Mark notification(s) as read
router.post('/mark-read', mobileNotificationController.markNotificationsRead);

module.exports = router; 