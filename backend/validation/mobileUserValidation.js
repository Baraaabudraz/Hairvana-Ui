const { body } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for updating user profile
 */
const updateProfileValidation = [
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Age must be between 13 and 120 years');
      }
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender selection'),
  
  body('hair_type')
    .optional()
    .isIn(['straight', 'wavy', 'curly', 'coily', 'kinky'])
    .withMessage('Invalid hair type'),
  
  body('hair_length')
    .optional()
    .isIn(['short', 'medium', 'long'])
    .withMessage('Invalid hair length'),
  
  body('hair_color')
    .optional()
    .isString()
    .withMessage('Hair color must be a string'),
  
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
  
  body('notifications_enabled')
    .optional()
    .isBoolean()
    .withMessage('Notifications enabled must be a boolean'),
  
  body('marketing_emails')
    .optional()
    .isBoolean()
    .withMessage('Marketing emails must be a boolean'),
];

/**
 * Validation schema for changing password
 */
const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required')
    .isLength({ min: 6 })
    .withMessage('Current password must be at least 6 characters'),
  
  body('new_password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirm_password')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
];

module.exports = {
  updateProfileValidation,
  changePasswordValidation,
}; 