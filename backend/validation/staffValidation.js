const { body } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for creating a new staff member
 */
const createStaffValidation = [
  body('salon_id')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  commonRules.requiredString('name').isLength({ min: 2 }).withMessage('Staff name must be at least 2 characters long'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  
  commonRules.phone(),
  
  body('role')
    .optional()
    .trim(),
  
  body('bio')
    .optional()
    .trim(),
  
  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
];

/**
 * Validation schema for updating an existing staff member
 */
const updateStaffValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Staff name must be at least 2 characters long'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  
  commonRules.phone(),
  
  body('role')
    .optional()
    .trim(),
  
  body('bio')
    .optional()
    .trim(),
  
  body('avatar')
    .optional()
    .trim()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
];

/**
 * Validation schema for assigning a service to a staff member
 */
const assignServiceValidation = [
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isUUID()
    .withMessage('Service ID must be a valid UUID')
];

/**
 * Validation schema for bulk creating staff members
 */
const bulkCreateStaffValidation = [
  body()
    .isArray()
    .withMessage('Request body must be an array of staff members'),
  
  body('*.salon_id')
    .notEmpty()
    .withMessage('Salon ID is required for each staff member')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
  
  body('*.name')
    .notEmpty()
    .withMessage('Name is required for each staff member')
    .isLength({ min: 2 })
    .withMessage('Staff name must be at least 2 characters long'),
];

module.exports = {
  createStaffValidation,
  updateStaffValidation,
  assignServiceValidation,
  bulkCreateStaffValidation
};