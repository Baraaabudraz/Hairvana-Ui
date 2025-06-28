const { body } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for creating a new service
 */
const createServiceValidation = [
  body('salon_id')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  commonRules.requiredString('name').isLength({ min: 2 }).withMessage('Service name must be at least 2 characters long'),
  
  commonRules.requiredNumber('price'),
  
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 5 })
    .withMessage('Duration must be at least 5 minutes'),
  
  body('description')
    .optional()
    .trim(),
  
  body('category')
    .optional()
    .trim(),
  
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),
];

/**
 * Validation schema for updating an existing service
 */
const updateServiceValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Service name must be at least 2 characters long'),
  
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number'),
  
  body('duration')
    .optional()
    .isInt({ min: 5 })
    .withMessage('Duration must be at least 5 minutes'),
  
  body('description')
    .optional()
    .trim(),
  
  body('category')
    .optional()
    .trim(),
  
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),
];

/**
 * Validation schema for bulk creating services
 */
const bulkCreateServicesValidation = [
  body()
    .isArray()
    .withMessage('Request body must be an array of services'),
  
  body('*.salon_id')
    .notEmpty()
    .withMessage('Salon ID is required for each service')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  body('*.name')
    .notEmpty()
    .withMessage('Name is required for each service')
    .isLength({ min: 2 })
    .withMessage('Service name must be at least 2 characters long'),
  
  body('*.price')
    .notEmpty()
    .withMessage('Price is required for each service')
    .isNumeric()
    .withMessage('Price must be a number'),
  
  body('*.duration')
    .notEmpty()
    .withMessage('Duration is required for each service')
    .isInt({ min: 5 })
    .withMessage('Duration must be at least 5 minutes'),
];

module.exports = {
  createServiceValidation,
  updateServiceValidation,
  bulkCreateServicesValidation
};