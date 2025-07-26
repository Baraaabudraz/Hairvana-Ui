const express = require('express');
const router = express.Router();

// Import controller and middleware
const salonServicesController = require('../../../../controllers/Api/salon/salonServicesController');
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const validate = require('../../../../middleware/validate');

// Import validation schemas
const {
  createServiceValidation,
  updateServiceValidation,
  addServiceToSalonValidation,
  serviceIdValidation,
} = require('../../../../validation/serviceValidation');

// All routes require authentication
router.use(authenticateOwner);

/**
 * @route   GET /backend/api/v0/salon/services/my-services
 * @desc    Get all services for the authenticated salon owner's salon
 * @access  Private (Salon Owner)
 */
router.get('/my-services', salonServicesController.getSalonServices);

/**
 * @route   GET /backend/api/v0/salon/services/all
 * @desc    Get all available services
 * @access  Private (Salon Owner)
 */
router.get('/all', salonServicesController.getAllServices);

/**
 * @route   POST /backend/api/v0/salon/services/create
 * @desc    Create a new service and add to salon
 * @access  Private (Salon Owner)
 */
router.post('/create',
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
 * @route   GET /backend/api/v0/salon/services/:serviceId
 * @desc    Get a specific service by ID
 * @access  Private (Salon Owner)
 */
router.get('/:serviceId', 
  serviceIdValidation,
  validate,
  salonServicesController.getServiceById
);

/**
 * @route   PUT /backend/api/v0/salon/services/:serviceId
 * @desc    Update a service
 * @access  Private (Salon Owner)
 */
router.put('/:serviceId',
  serviceIdValidation,
  updateServiceValidation,
  validate,
  salonServicesController.updateService
);

/**
 * @route   DELETE /backend/api/v0/salon/services/:serviceId/remove
 * @desc    Remove a service from the salon
 * @access  Private (Salon Owner)
 */
router.delete('/:serviceId/remove',
  serviceIdValidation,
  validate,
  salonServicesController.removeServiceFromSalon
);

module.exports = router; 