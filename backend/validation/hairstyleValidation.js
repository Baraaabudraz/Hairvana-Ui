const { query, param } = require('express-validator');
const { commonRules } = require('./index');

/**
 * Validation schema for getting hairstyles with filters
 */
const getHairstylesValidation = [
  query('gender')
    .optional()
    .isIn(['male', 'female', 'unisex'])
    .withMessage('Gender must be male, female, or unisex'),
  
  query('length')
    .optional()
    .isIn(['short', 'medium', 'long'])
    .withMessage('Length must be short, medium, or long'),
  
  query('color')
    .optional()
    .isString()
    .withMessage('Color must be a string'),
  
  query('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  
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
 * Validation schema for getting hairstyle by ID
 */
const getHairstyleByIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Hairstyle ID is required')
    .isUUID()
    .withMessage('Hairstyle ID must be a valid UUID'),
];

module.exports = {
  getHairstylesValidation,
  getHairstyleByIdValidation,
}; 