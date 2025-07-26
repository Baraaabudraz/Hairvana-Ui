const { body, query, param } = require('express-validator');

/**
 * Validation schema for creating a staff member
 */
const createStaffValidation = [
  body('salon_id')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),

  body('name')
    .notEmpty()
    .withMessage('Staff name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Staff name must be between 2 and 100 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Phone number must be valid'),

  body('role')
    .optional()
    .isIn(['stylist', 'assistant', 'manager', 'receptionist', 'apprentice'])
    .withMessage('Role must be one of: stylist, assistant, manager, receptionist, apprentice'),

  body('hourly_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),

  body('commission_rate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Commission rate must be between 0 and 100'),

  body('specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),

  body('experience_years')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),
];

/**
 * Validation schema for updating a staff member
 */
const updateStaffValidation = [
  param('staffId')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isUUID()
    .withMessage('Staff ID must be a valid UUID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Staff name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Phone number must be valid'),

  body('role')
    .optional()
    .isIn(['stylist', 'assistant', 'manager', 'receptionist', 'apprentice'])
    .withMessage('Role must be one of: stylist, assistant, manager, receptionist, apprentice'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'on_leave', 'terminated'])
    .withMessage('Status must be one of: active, inactive, on_leave, terminated'),

  body('hourly_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),

  body('commission_rate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Commission rate must be between 0 and 100'),

  body('specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),

  body('experience_years')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),

  body('schedule')
    .optional()
    .isObject()
    .withMessage('Schedule must be an object'),
];

/**
 * Validation schema for staff query parameters
 */
const staffQueryValidation = [
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
    .custom((value) => {
      const validStatuses = ['active', 'inactive', 'on_leave', 'terminated'];
      if (Array.isArray(value)) {
        return value.every(status => validStatuses.includes(status));
      }
      return validStatuses.includes(value);
    })
    .withMessage('Status must be one of: active, inactive, on_leave, terminated'),

  query('role')
    .optional()
    .custom((value) => {
      const validRoles = ['stylist', 'assistant', 'manager', 'receptionist', 'apprentice'];
      if (Array.isArray(value)) {
        return value.every(role => validRoles.includes(role));
      }
      return validRoles.includes(value);
    })
    .withMessage('Role must be one of: stylist, assistant, manager, receptionist, apprentice'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

/**
 * Validation schema for staff ID parameter
 */
const staffIdValidation = [
  param('staffId')
    .notEmpty()
    .withMessage('Staff ID is required')
    .isUUID()
    .withMessage('Staff ID must be a valid UUID'),
];

/**
 * Validation schema for salon ID parameter
 */
const salonIdValidation = [
  param('salonId')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
];

/**
 * Validation schema for staff deletion
 */
const deleteStaffValidation = [
  ...staffIdValidation,
  
  query('permanent')
    .optional()
    .isBoolean()
    .withMessage('Permanent must be a boolean value'),
];

module.exports = {
  createStaffValidation,
  updateStaffValidation,
  staffQueryValidation,
  staffIdValidation,
  salonIdValidation,
  deleteStaffValidation,
};