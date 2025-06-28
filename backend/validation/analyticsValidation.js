const { query, body } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for fetching analytics data
 */
const getAnalyticsValidation = [
  query('period')
    .optional()
    .isIn(['7d', '30d', '90d', '1y', 'custom'])
    .withMessage('Invalid period value'),
  
  query('startDate')
    .if(query('period').equals('custom'))
    .notEmpty()
    .withMessage('Start date is required for custom period')
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .if(query('period').equals('custom'))
    .notEmpty()
    .withMessage('End date is required for custom period')
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  query('filter')
    .optional()
    .isIn(['all', 'salons', 'users', 'subscriptions', 'appointments'])
    .withMessage('Invalid filter value'),
];

/**
 * Validation schema for generating a report
 */
const generateReportValidation = [
  body('templateId')
    .notEmpty()
    .withMessage('Template ID is required'),
  
  body('parameters')
    .notEmpty()
    .withMessage('Parameters are required')
    .isObject()
    .withMessage('Parameters must be an object'),
  
  body('parameters.dateRange')
    .notEmpty()
    .withMessage('Date range is required')
    .isIn(['7d', '30d', '90d', '1y', 'custom'])
    .withMessage('Invalid date range value'),
  
  body('parameters.startDate')
    .if(body('parameters.dateRange').equals('custom'))
    .notEmpty()
    .withMessage('Start date is required for custom date range')
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('parameters.endDate')
    .if(body('parameters.dateRange').equals('custom'))
    .notEmpty()
    .withMessage('End date is required for custom date range')
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  body('parameters.format')
    .notEmpty()
    .withMessage('Format is required')
    .isIn(['pdf', 'excel', 'csv', 'interactive'])
    .withMessage('Invalid format value'),
  
  body('parameters.filters')
    .optional()
    .isArray()
    .withMessage('Filters must be an array'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Report name must be between 3 and 100 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('schedule')
    .optional()
    .isIn(['once', 'daily', 'weekly', 'monthly'])
    .withMessage('Invalid schedule value'),
];

module.exports = {
  getAnalyticsValidation,
  generateReportValidation
};