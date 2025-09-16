const { body, param, query } = require('express-validator');

// Validation for creating support tickets
const createTicketValidation = [
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

// Validation for updating support tickets
const updateTicketValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid ticket ID'),
  
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'pending_user', 'resolved', 'closed'])
    .withMessage('Invalid status'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Invalid assigned user ID'),
  
  body('resolution_notes')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Resolution notes must be at least 5 characters long')
];

// Validation for adding messages
const addMessageValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid ticket ID'),
  
  body('message')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Message cannot be empty'),
  
  body('is_internal')
    .optional()
    .isBoolean()
    .withMessage('is_internal must be a boolean'),
  
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array')
];

// Validation for processing cancellations
const processCancellationValidation = [
  param('ticketId')
    .isUUID()
    .withMessage('Invalid ticket ID'),
  
  body('reason')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Cancellation reason must be at least 5 characters long'),
  
  body('immediate')
    .optional()
    .isBoolean()
    .withMessage('immediate must be a boolean')
];

// Validation for processing refunds
const processRefundValidation = [
  param('ticketId')
    .isUUID()
    .withMessage('Invalid ticket ID'),
  
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('reason')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Refund reason must be at least 5 characters long'),
  
  body('refund_method')
    .optional()
    .isIn(['original', 'store_credit', 'bank_transfer'])
    .withMessage('Invalid refund method')
];

// Validation for query parameters
const getTicketsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
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
    .withMessage('Invalid priority filter'),
  
  query('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Invalid assigned user ID filter'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
];

// Validation for ticket ID parameter
const ticketIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid ticket ID')
];

module.exports = {
  createTicketValidation,
  updateTicketValidation,
  addMessageValidation,
  processCancellationValidation,
  processRefundValidation,
  getTicketsValidation,
  ticketIdValidation
};
