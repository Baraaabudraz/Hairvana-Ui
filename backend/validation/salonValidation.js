const { body } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for creating a new salon
 */
const createSalonValidation = [
  commonRules.requiredString('name').isLength({ min: 2 }).withMessage('Salon name must be at least 2 characters long'),
  commonRules.email(),
  commonRules.phone(),
  
  body('address')
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage('Address must be at least 5 characters long'),
  
  body('location')
    .optional()
    .trim(),
  
  body('owner_id')
    .notEmpty()
    .withMessage('Owner ID is required')
    .isUUID()
    .withMessage('Owner ID must be a valid UUID'),
  
  body('owner_name')
    .optional()
    .trim(),
  
  body('owner_email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid owner email address'),
  
  body('status')
    .optional()
    .isIn(['active', 'pending', 'suspended'])
    .withMessage('Invalid salon status'),
  
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  
  body('hours')
    .optional()
    .isObject()
    .withMessage('Hours must be an object'),
  
  body('business_license')
    .optional()
    .trim(),
  
  body('tax_id')
    .optional()
    .trim(),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  
  body('description')
    .optional()
    .trim(),
];

/**
 * Validation schema for updating an existing salon
 */
const updateSalonValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Salon name must be at least 2 characters long'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  
  commonRules.phone(),
  
  body('address')
    .optional()
    .trim(),
  
  body('location')
    .optional()
    .trim(),
  
  body('status')
    .optional()
    .isIn(['active', 'pending', 'suspended'])
    .withMessage('Invalid salon status'),
  
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  
  body('hours')
    .optional()
    .isObject()
    .withMessage('Hours must be an object'),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  
  body('description')
    .optional()
    .trim(),
  
  body('business_license')
    .optional()
    .trim(),
  
  body('tax_id')
    .optional()
    .trim(),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
];

/**
 * Validation schema for updating salon status
 */
const updateSalonStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'pending', 'suspended'])
    .withMessage('Invalid status value')
];

module.exports = {
  createSalonValidation,
  updateSalonValidation,
  updateSalonStatusValidation
};