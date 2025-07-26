const { body, query, param } = require('express-validator');
const { commonRules } = require('./index');
const { Salon } = require('../models');

/**
 * Validation schema for creating a new salon
 */
const createSalonValidation = [
  body('name')
    .notEmpty()
    .withMessage('Salon name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Salon name must be between 2 and 100 characters')
    .custom(async (value) => {
      const existingSalon = await Salon.findOne({ where: { name: value } });
      if (existingSalon) {
        throw new Error('Salon name already exists. Please choose a different name.');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('street_address')
    .notEmpty()
    .withMessage('Street address is required')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  
  body('city')
    .notEmpty()
    .withMessage('City is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
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
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('ZIP code must be in format 12345 or 12345-6789'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
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
    .normalizeEmail()
    .custom(async (value) => {
      const existingSalon = await Salon.findOne({ where: { email: value } });
      if (existingSalon) {
        throw new Error('Email address already exists. Please use a different email.');
      }
      return true;
    }),
  
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
  
  body('hours')
    .notEmpty()
    .withMessage('Operating hours are required')
    .custom((value) => {
      // Allow object, array, or string format
      if (typeof value === 'object' && value !== null) {
        return true; // Object or array is valid
      }
      if (typeof value === 'string') {
        return true; // String is valid
      }
      throw new Error('Hours must be an object, array, or string');
    })
    .withMessage('Hours must be an object, array, or string'),
  
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
  
  body('gallery')
    .optional()
    .isArray()
    .withMessage('Gallery must be an array'),
  
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Invalid salon status'),
  
  body('owner_id')
    .optional()
    .isUUID()
    .withMessage('Owner ID must be a valid UUID'),
];

/**
 * Validation schema for updating a salon
 */
const updateSalonValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Salon name must be between 2 and 100 characters')
    .custom(async (value, { req }) => {
      if (value) {
        const existingSalon = await Salon.findOne({ 
          where: { 
            name: value,
            id: { [require('sequelize').Op.ne]: req.params.id || req.body.id }
          } 
        });
        if (existingSalon) {
          throw new Error('Salon name already exists. Please choose a different name.');
        }
      }
      return true;
    }),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('street_address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('zip_code')
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('ZIP code must be in format 12345 or 12345-6789'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .custom(async (value, { req }) => {
      if (value) {
        const existingSalon = await Salon.findOne({ 
          where: { 
            email: value,
            id: { [require('sequelize').Op.ne]: req.params.id || req.body.id }
          } 
        });
        if (existingSalon) {
          throw new Error('Email address already exists. Please use a different email.');
        }
      }
      return true;
    }),
  
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
 * Validation schema for updating salon profile (owner-specific)
 */
const updateSalonProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Salon name must be between 2 and 100 characters')
    .custom(async (value, { req }) => {
      if (value && req.user && req.user.id) {
        // Find the current user's salon to exclude it from uniqueness check
        const currentUserSalon = await Salon.findOne({ where: { owner_id: req.user.id } });
        const whereClause = { name: value };
        
        if (currentUserSalon) {
          whereClause.id = { [require('sequelize').Op.ne]: currentUserSalon.id };
        }
        
        const existingSalon = await Salon.findOne({ where: whereClause });
        if (existingSalon) {
          throw new Error('Salon name already exists. Please choose a different name.');
        }
      }
      return true;
    }),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('street_address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  
  body('zip_code')
    .optional()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('ZIP code must be in format 12345 or 12345-6789'),
  
  body('country')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number format'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail()
    .custom(async (value, { req }) => {
      if (value && req.user && req.user.id) {
        // Find the current user's salon to exclude it from uniqueness check
        const currentUserSalon = await Salon.findOne({ where: { owner_id: req.user.id } });
        const whereClause = { email: value };
        
        if (currentUserSalon) {
          whereClause.id = { [require('sequelize').Op.ne]: currentUserSalon.id };
        }
        
        const existingSalon = await Salon.findOne({ where: whereClause });
        if (existingSalon) {
          throw new Error('Email address already exists. Please use a different email.');
        }
      }
      return true;
    }),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  
  body('business_license')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Business license must be between 1 and 100 characters'),
  
  body('tax_id')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tax ID must be between 1 and 50 characters'),
  
  body('hours')
    .optional()
    .custom((value) => {
      // Allow object, array, or string format
      if (typeof value === 'object' && value !== null) {
        return true; // Object or array is valid
      }
      if (typeof value === 'string') {
        return true; // String is valid
      }
      throw new Error('Hours must be an object, array, or string');
    })
    .withMessage('Hours must be an object, array, or string'),
  
  body('avatar')
    .optional()
    .isString()
    .withMessage('Avatar must be a string'),
  
  body('gallery')
    .optional()
    .isArray()
    .withMessage('Gallery must be an array'),
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
  updateSalonProfileValidation,
  getSalonsValidation,
  getSalonByIdValidation,
  searchSalonsValidation,
};