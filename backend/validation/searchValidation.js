const { query } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for global search
 */
const globalSearchValidation = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
  
  query('type')
    .optional()
    .isIn(['all', 'salons', 'users', 'services', 'staff', 'appointments'])
    .withMessage('Invalid search type'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be at least 1'),
];

/**
 * Validation schema for salon search
 */
const salonSearchValidation = [
  query('q')
    .optional(),
  
  query('status')
    .optional()
    .isIn(['all', 'active', 'pending', 'suspended'])
    .withMessage('Invalid status value'),
  
  query('location')
    .optional(),
  
  query('services')
    .optional(),
  
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be at least 1'),
];

/**
 * Validation schema for service search
 */
const serviceSearchValidation = [
  query('q')
    .optional(),
  
  query('salonId')
    .optional()
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  query('category')
    .optional(),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be at least 0'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be at least 0'),
  
  query('minDuration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum duration must be at least 0'),
  
  query('maxDuration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum duration must be at least 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be at least 1'),
];

module.exports = {
  globalSearchValidation,
  salonSearchValidation,
  serviceSearchValidation
};