const { body } = require('express-validator');

const createServiceValidation = [
  body('salon_id')
    .notEmpty()
    .withMessage('Salon ID is required'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ min: 2 })
    .withMessage('Service name must be at least 2 characters long'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a number'),
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

module.exports = {
  createServiceValidation,
  updateServiceValidation,
};