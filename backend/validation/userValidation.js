const { body } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for creating a new user
 */
const createUserValidation = [
  commonRules.requiredString('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  commonRules.email(),
  commonRules.password(),
  commonRules.enum('role', ['admin', 'super_admin', 'salon', 'user']),
  commonRules.phone(),
  
  // Conditional validation for admin/super_admin roles
  body('permissions')
    .if(body('role').isIn(['admin', 'super_admin']))
    .notEmpty()
    .withMessage('Permissions are required for admin roles')
    .isArray()
    .withMessage('Permissions must be an array'),
  
  // Conditional validation for salon role
  body('salonName')
    .if(body('role').equals('salon'))
    .trim()
    .notEmpty()
    .withMessage('Salon name is required for salon owners'),
  
  body('salonAddress')
    .if(body('role').equals('salon'))
    .trim()
    .notEmpty()
    .withMessage('Salon address is required for salon owners'),
  
  body('businessLicense')
    .if(body('role').equals('salon'))
    .trim()
    .notEmpty()
    .withMessage('Business license is required for salon owners'),
  
  body('subscription')
    .if(body('role').equals('salon'))
    .notEmpty()
    .withMessage('Subscription plan is required for salon owners')
    .isIn(['Basic', 'Standard', 'Premium'])
    .withMessage('Invalid subscription plan'),
];

/**
 * Validation schema for updating an existing user
 */
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  
  body('role')
    .optional()
    .isIn(['admin', 'super_admin', 'salon', 'user'])
    .withMessage('Invalid user role'),
  
  commonRules.phone(),
  
  body('status')
    .optional()
    .isIn(['active', 'pending', 'suspended'])
    .withMessage('Invalid user status'),
  
  // Conditional validation for admin/super_admin roles
  body('permissions')
    .if(body('role').isIn(['admin', 'super_admin']))
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];

/**
 * Validation schema for updating user status
 */
const updateUserStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'pending', 'suspended'])
    .withMessage('Invalid status value')
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  updateUserStatusValidation
};