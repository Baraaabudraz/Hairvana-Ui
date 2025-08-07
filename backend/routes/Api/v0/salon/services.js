const express = require('express');
const router = express.Router();

// Import controller and middleware
const salonServicesController = require('../../../../controllers/Api/salon/salonServicesController');
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const validate = require('../../../../middleware/validate');
const { createUploadMiddleware } = require('../../../../helpers/uploadHelper');

// Import validation schemas
const {
  createServiceValidation,
  updateServiceValidation,
  addServiceToSalonValidation,
  serviceIdValidation,
  salonIdValidation,
  salonServiceValidation,
} = require('../../../../validation/serviceValidation');

// All routes require authentication
router.use(authenticateOwner);

// Create upload middleware for service images
const uploadServiceImage = createUploadMiddleware({
  uploadDir: '/services',
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
});

/**
 * @route   GET /backend/api/v0/salon/services/:salonId/services
 * @desc    Get all services for a specific salon
 * @access  Private (Salon Owner)
 */
router.get('/salon/:salonId/services',
  salonIdValidation,
  validate,
  salonServicesController.getSalonServices
);

/**
 * @route   GET /backend/api/v0/salon/services/all
 * @desc    Get all available services
 * @access  Private (Salon Owner)
 */
router.get('/all', salonServicesController.getAllServices);

/**
 * @route   POST /backend/api/v0/salon/services/:salonId/create
 * @desc    Create a new service and add to specific salon
 * @access  Private (Salon Owner)
 */
router.post('/salon/:salonId/service/create',
  salonIdValidation,
  uploadServiceImage.single('image'), // Handle single image upload
  createServiceValidation,
  validate,
  salonServicesController.createService
);

/**
 * @route   POST /backend/api/v0/salon/services/add-to-salon
 * @desc    Add an existing service to the salon
 * @access  Private (Salon Owner)
 */
router.post('/add-to-salon',
  addServiceToSalonValidation,
  validate,
  salonServicesController.addServiceToSalon
);

/**
 * @route   GET /backend/api/v0/salon/services/:salonId/:serviceId
 * @desc    Get a specific service by ID for a salon
 * @access  Private (Salon Owner)
 */
router.get('/salon/:salonId/service/:serviceId', 
  salonServiceValidation,
  validate,
  salonServicesController.getServiceById
);

/**
 * @route   PUT /backend/api/v0/salon/services/:salonId/:serviceId
 * @desc    Update a service for a specific salon
 * @access  Private (Salon Owner)
 */
router.put('/salon/:salonId/service/:serviceId',
  salonServiceValidation,
  uploadServiceImage.single('image'), // Handle single image upload
  updateServiceValidation,
  validate,
  salonServicesController.updateService
);

/**
 * @route   DELETE /backend/api/v0/salon/services/:salonId/:serviceId
 * @desc    Remove a service from the salon
 * @access  Private (Salon Owner)
 */
router.delete('/salon/:salonId/service/:serviceId',
  salonServiceValidation,
  validate,
  salonServicesController.removeServiceFromSalon
);

module.exports = router; 