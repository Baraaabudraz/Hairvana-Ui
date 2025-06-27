const { body } = require('express-validator');

const createStaffValidation = [
  body('salon_id')
    .notEmpty()
    .withMessage('Salon ID is required'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Staff name is required')
    .isLength({ min: 2 })
    .withMessage('Staff name must be at least 2 characters long'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email address'),
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
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
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
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

module.exports = {
  createStaffValidation,
  updateStaffValidation,
};