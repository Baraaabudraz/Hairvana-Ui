const express = require('express');
const router = express.Router();
const { registerDevice } = require('../../../../controllers/Api/salon/mobileDeviceController');
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');

/**
 * Salon Owner Mobile Device Routes
 * 
 * All routes require salon owner authentication
 * Base path: /api/v0/salon/devices
 */

/**
 * @route   POST /api/v0/salon/devices
 * @desc    Register/update mobile device for salon owner
 * @access  Private (Salon Owner)
 * 
 * Body Parameters:
 * - device_token: string (required) - Push notification device token
 * - device_type: string (required) - Device type (ios/android)
 */
router.post('/', authenticateOwner, registerDevice);

module.exports = router;
