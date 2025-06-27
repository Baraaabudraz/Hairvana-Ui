const { body } = require('express-validator');

const createSalonValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Salon name is required')
    .isLength({ min: 2 })
    .withMessage('Salon name must be at least 2 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
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
    .withMessage('Owner ID is required'),
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
];

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
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('any')
    .withMessage('Invalid phone number format'),
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
];

module.exports = {
  createSalonValidation,
  updateSalonValidation,
};