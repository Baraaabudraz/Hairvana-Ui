const { body, query, param } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for creating a new salon
 */
const createSalonValidation = [
  body('name')
    .notEmpty()
    .withMessage('Salon name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Salon name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  
  body('city')
    .notEmpty()
    .withMessage('City is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('state')
    .notEmpty()
    .withMessage('State is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('zip_code')
    .notEmpty()
    .withMessage('ZIP code is required')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('ZIP code must be between 5 and 10 characters'),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('working_hours')
    .optional()
    .isObject()
    .withMessage('Working hours must be an object'),
  
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Invalid salon status'),
];

/**
 * Validation schema for updating a salon
 */
const updateSalonValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Salon name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('zip_code')
    .optional()
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('ZIP code must be between 5 and 10 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('working_hours')
    .optional()
    .isObject()
    .withMessage('Working hours must be an object'),
  
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Invalid salon status'),
];

/**
 * Validation schema for getting salons with filters
 */
const getSalonsValidation = [
  query('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  
  query('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  query('city')
    .optional()
    .isString()
    .withMessage('City must be a string'),
  
  query('state')
    .optional()
    .isString()
    .withMessage('State must be a string'),
  
  query('service')
    .optional()
    .isString()
    .withMessage('Service must be a string'),
  
  query('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  query('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  query('radius')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Radius must be between 0 and 100 km'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

/**
 * Validation schema for getting salon by ID
 */
const getSalonByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Salon ID is required')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
];

/**
 * Validation schema for searching salons
 */
const searchSalonsValidation = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
  
  query('city')
    .optional()
    .isString()
    .withMessage('City must be a string'),
  
  query('state')
    .optional()
    .isString()
    .withMessage('State must be a string'),
  
  query('service')
    .optional()
    .isString()
    .withMessage('Service must be a string'),
  
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
];

module.exports = {
  createSalonValidation,
  updateSalonValidation,
  getSalonsValidation,
  getSalonByIdValidation,
  searchSalonsValidation,
};