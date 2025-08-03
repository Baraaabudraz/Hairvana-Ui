const { body, param } = require('express-validator');
const { Service, Salon } = require('../models');

/**
 * Validation schema for creating a service
 */
const createServiceValidation = [
  body('name')
    .notEmpty()
    .withMessage('Service name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters')
    .custom(async (value, { req }) => {
      if (!req.user || !req.user.id) {
        throw new Error('Authentication required');
      }
      
      const salonId = req.params.salonId;
      if (!salonId) {
        throw new Error('Salon ID is required');
      }
      
      // Verify that the authenticated user owns this salon
      const salon = await Salon.findOne({ 
        where: { 
          id: salonId,
          owner_id: req.user.id 
        } 
      });
      
      if (!salon) {
        throw new Error('Salon not found or access denied');
      }
      
      // Check if service name already exists for this salon
      const existingService = await Service.findOne({
        include: [{
          model: Salon,
          as: 'salons',
          where: { id: salonId },
          required: true
        }],
        where: { name: value }
      });
      
      if (existingService) {
        throw new Error('A service with this name already exists in this salon');
      }
      
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (minutes)'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'discontinued'])
    .withMessage('Status must be active, inactive, or discontinued'),

  body('is_popular')
    .optional()
    .isBoolean()
    .withMessage('is_popular must be a boolean'),

  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  body('special_offers')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      
      // Allow objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        return true;
      }
      
      // Allow arrays and transform them
      if (Array.isArray(value)) {
        return true;
      }
      
      throw new Error('Special offers must be an object or array');
    }),
];

/**
 * Validation schema for updating a service
 */
const updateServiceValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters')
    .custom(async (value, { req }) => {
      if (!value) return true; // Skip validation if name is not provided
      
      if (!req.user || !req.user.id) {
        throw new Error('Authentication required');
      }
      
      if (!req.params.serviceId) {
        throw new Error('Service ID is required for update');
      }
      
      // Find the salon for the authenticated owner
      const salon = await Salon.findOne({ where: { owner_id: req.user.id } });
      if (!salon) {
        throw new Error('Salon not found for this owner');
      }
      
      // Check if service name already exists for this salon (excluding current service)
      const existingService = await Service.findOne({
        include: [{
          model: Salon,
          as: 'salons',
          where: { id: salon.id },
          required: true
        }],
        where: { 
          name: value,
          id: { [require('sequelize').Op.ne]: req.params.serviceId }
        }
      });
      
      if (existingService) {
        throw new Error('A service with this name already exists in your salon');
      }
      
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (minutes)'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'discontinued'])
    .withMessage('Status must be active, inactive, or discontinued'),

  body('is_popular')
    .optional()
    .isBoolean()
    .withMessage('is_popular must be a boolean'),

  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),

  body('special_offers')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      
      // Allow objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        return true;
      }
      
      // Allow arrays and transform them
      if (Array.isArray(value)) {
        return true;
      }
      
      throw new Error('Special offers must be an object or array');
    }),
];

/**
 * Validation schema for adding service to salon
 */
const addServiceToSalonValidation = [
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isUUID()
    .withMessage('Service ID must be a valid UUID'),
];

/**
 * Validation schema for service ID parameter
 */
const serviceIdValidation = [
  param('serviceId')
    .isUUID()
    .withMessage('Service ID must be a valid UUID'),
];

/**
 * Validation schema for salon ID parameter
 */
const salonIdValidation = [
  param('salonId')
    .isUUID()
    .withMessage('Salon ID must be a valid UUID'),
];

module.exports = {
  createServiceValidation,
  updateServiceValidation,
  addServiceToSalonValidation,
  serviceIdValidation,
  salonIdValidation,
};