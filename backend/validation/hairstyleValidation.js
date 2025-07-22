const { body, param, query } = require('express-validator');
const hairstyleService = require('../services/hairstyleService');
const { Salon } = require('../models');

const createHairstyleValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .custom(async (value, { req }) => {
      const salon = await Salon.findOne({ where: { owner_id: req.user.id } });
      if (!salon) throw new Error('Salon not found');
      const existing = await hairstyleService.findAllBySalon(salon.id);
      if (existing.some(h => h.name && h.name.toLowerCase() === value.toLowerCase())) {
        throw new Error('A hairstyle with this name already exists.');
      }
      return true;
    }),
  body('gender').optional().isString(),
  body('length').optional().isString(),
  body('color').optional().isString(),
  body('tags').optional(),
  body('description').optional().isString(),
];

const updateHairstyleValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .custom(async (value, { req }) => {
      const salon = await Salon.findOne({ where: { owner_id: req.user.id } });
      if (!salon) throw new Error('Salon not found');
      const existing = await hairstyleService.findAllBySalon(salon.id);
      // On update, allow the same name if it's the same record
      if (req.method === 'PUT' && req.params.id) {
        const current = existing.find(h => h.id == req.params.id);
        if (current && current.name.toLowerCase() === value.toLowerCase()) return true;
      }
      if (existing.some(h => h.name && h.name.toLowerCase() === value.toLowerCase())) {
        throw new Error('A hairstyle with this name already exists.');
      }
      return true;
    }),
  body('gender').optional().isString(),
  body('length').optional().isString(),
  body('color').optional().isString(),
  body('tags').optional(),
  body('description').optional().isString(),
];

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
  createHairstyleValidation,
  updateHairstyleValidation,
  getHairstylesValidation,
  getHairstyleByIdValidation,
}; 