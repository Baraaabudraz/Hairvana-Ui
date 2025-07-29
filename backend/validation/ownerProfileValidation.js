const { body } = require('express-validator');

/**
 * Validation rules for owner profile endpoints
 */

// Get profile validation (minimal - just checks authentication)
const getProfileValidation = [];

// Update profile validation
const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
    .trim(),
  
  body('avatar')
    .optional()
    .isString()
    .withMessage('Avatar must be a string')
    .trim()
];

// Upload avatar validation
const uploadAvatarValidation = [
  // File validation is handled by multer middleware
  // This is for any additional validation if needed
];

// Change password validation
const changePasswordValidation = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required')
    .isLength({ min: 1 })
    .withMessage('Old password cannot be empty'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

module.exports = {
  getProfileValidation,
  updateProfileValidation,
  uploadAvatarValidation,
  changePasswordValidation
}; 