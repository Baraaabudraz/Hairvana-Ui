const { body, param, query } = require('express-validator');

// Validation for salon owner creating support tickets
const createSalonSupportTicketValidation = [
  body('category')
    .isIn([
      'subscription_cancellation',
      'refund_request',
      'billing_issue',
      'technical_support',
      'account_issue',
      'feature_request',
      'general_inquiry',
      'bug_report'
    ])
    .withMessage('Invalid category'),
  
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('subscription_id')
    .optional()
    .isUUID()
    .withMessage('Invalid subscription ID'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Validation for salon owner adding messages
const addSalonSupportMessageValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid ticket ID'),
  
  body('message')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message cannot be empty')
];

// Validation for salon owner query parameters
const getSalonSupportTicketsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('status')
    .optional()
    .isIn(['open', 'in_progress', 'pending_user', 'resolved', 'closed'])
    .withMessage('Invalid status filter'),
  
  query('category')
    .optional()
    .isIn([
      'subscription_cancellation',
      'refund_request',
      'billing_issue',
      'technical_support',
      'account_issue',
      'feature_request',
      'general_inquiry',
      'bug_report'
    ])
    .withMessage('Invalid category filter'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority filter')
];

// Validation for ticket ID parameter
const salonSupportTicketIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid ticket ID')
];

module.exports = {
  createSalonSupportTicketValidation,
  addSalonSupportMessageValidation,
  getSalonSupportTicketsValidation,
  salonSupportTicketIdValidation
};
