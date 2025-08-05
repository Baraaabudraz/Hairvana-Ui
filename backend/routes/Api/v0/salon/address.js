const express = require('express');
const router = express.Router();

// Import controller and middleware
const salonAddressController = require('../../../../controllers/Api/salon/salonAddressController');
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const validate = require('../../../../middleware/validate');

// Import validation schemas
const {
  createAddressValidation,
  updateAddressValidation,
} = require('../../../../validation/addressValidation');

// Import salon ID validation
const { salonIdValidation } = require('../../../../validation/salonValidation');

// All routes require authentication
router.use(authenticateOwner);

/**
 * @route   POST /backend/api/v0/salon/address/:salonId
 * @desc    Create a new address for a specific salon
 * @access  Private (Salon Owner)
 */
router.post('/:salonId',
  salonIdValidation,
  createAddressValidation,
  validate,
  salonAddressController.createSalonAddress
);

/**
 * @route   GET /backend/api/v0/salon/address/:salonId
 * @desc    Get the address for a specific salon
 * @access  Private (Salon Owner)
 */
router.get('/:salonId',
  salonIdValidation,
  validate,
  salonAddressController.getSalonAddress
);

/**
 * @route   PUT /backend/api/v0/salon/address/:salonId
 * @desc    Update the address for a specific salon
 * @access  Private (Salon Owner)
 */
router.put('/:salonId',
  salonIdValidation,
  updateAddressValidation,
  validate,
  salonAddressController.updateSalonAddress
);

/**
 * @route   DELETE /backend/api/v0/salon/address/:salonId
 * @desc    Delete the address for a specific salon
 * @access  Private (Salon Owner)
 */
router.delete('/:salonId',
  salonIdValidation,
  validate,
  salonAddressController.deleteSalonAddress
);

module.exports = router; 