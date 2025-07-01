const { Notification, NotificationTemplate } = require('../models');
const { Sequelize } = require('sequelize');

// Get all notifications
exports.getAllNotifications = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    const where = {};
    if (type && type !== 'all') where.type = type;
    if (status && status !== 'all') where.status = status;
    if (search) {
      where[Sequelize.Op.or] = [
        { title: { [Sequelize.Op.iLike]: `%${search}%` } },
        { message: { [Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    const notifications = await Notification.findAll({ where });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// Create a new notification
exports.createNotification = async (req, res, next) => {
  try {
    const notificationData = req.body;
    notificationData.createdBy = req.user.name || req.user.email;
    notificationData.createdAt = new Date();
    if (notificationData.scheduleType === 'now') {
      notificationData.status = 'sent';
      notificationData.sentAt = new Date();
    } else if (notificationData.scheduleType === 'later') {
      notificationData.status = 'scheduled';
      notificationData.scheduledAt = notificationData.scheduledAt;
    } else {
      notificationData.status = 'draft';
    }
    delete notificationData.scheduleType;
    const newNotification = await Notification.create(notificationData);
    res.status(201).json(newNotification);
  } catch (error) {
    next(error);
  }
};

// Get notification templates
exports.getNotificationTemplates = async (req, res, next) => {
  try {
    const templates = await NotificationTemplate.findAll();
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

// Delete a notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Notification.destroy({ where: { id } });
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Send a notification
exports.sendNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.status = 'sent';
    notification.sentAt = new Date();
    await notification.save();
    res.json({
      id,
      status: 'sent',
      sentAt: notification.sentAt,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    next(error);
  }
};