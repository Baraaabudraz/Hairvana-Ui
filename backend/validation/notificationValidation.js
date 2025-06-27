const { body } = require('express-validator');

const createNotificationValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters long'),
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['info', 'success', 'warning', 'error', 'announcement', 'promotion'])
    .withMessage('Invalid notification type'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('targetAudience')
    .notEmpty()
    .withMessage('Target audience is required')
    .isIn(['all', 'salons', 'users', 'admins', 'custom'])
    .withMessage('Invalid target audience'),
  body('channels')
    .notEmpty()
    .withMessage('At least one channel is required')
    .isArray()
    .withMessage('Channels must be an array')
    .custom(channels => {
      const validChannels = ['email', 'push', 'in-app', 'sms'];
      return channels.every(channel => validChannels.includes(channel));
    })
    .withMessage('Invalid channel type'),
  body('scheduleType')
    .notEmpty()
    .withMessage('Schedule type is required')
    .isIn(['now', 'later'])
    .withMessage('Invalid schedule type'),
  body('scheduledAt')
    .if(body('scheduleType').equals('later'))
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('customFilters')
    .if(body('targetAudience').equals('custom'))
    .isObject()
    .withMessage('Custom filters must be an object'),
];

module.exports = {
  createNotificationValidation,
};