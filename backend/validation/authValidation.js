const { body } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for user login
 */
const loginValidation = [
  commonRules.email(),
  commonRules.password(),
  
  // Optional device info for mobile apps
  body('deviceToken')
    .optional()
    .trim(),
  
  body('deviceType')
    .optional()
    .isIn(['ios', 'android', 'web'])
    .withMessage('Invalid device type'),
];

/**
 * Validation schema for user registration
 */
const registerValidation = [
  commonRules.requiredString('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  commonRules.email(),
  commonRules.password(),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['user', 'salon'])
    .withMessage('Invalid user role for registration'),
  
  commonRules.phone(),
  
  // Optional device info for mobile apps
  body('deviceToken')
    .optional()
    .trim(),
  
  body('deviceType')
    .optional()
    .isIn(['ios', 'android', 'web'])
    .withMessage('Invalid device type'),
];

/**
 * Validation schema for password change
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

/**
 * Validation schema for password reset request
 */
const forgotPasswordValidation = [
  commonRules.email(),
];

/**
 * Validation schema for password reset
 */
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

/**
 * Validation schema for updating user profile
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  
  commonRules.phone(),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
];

module.exports = {
  loginValidation,
  registerValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation
};