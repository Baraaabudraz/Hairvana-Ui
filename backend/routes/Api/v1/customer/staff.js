const express = require('express');
const router = express.Router();
const mobileStaffController = require('../../../../controllers/Api/customer/mobileStaffController');
const { authenticateCustomer } = require('../../../../middleware/passportMiddleware');

router.use(authenticateCustomer);

// List staff for a salon by salon_id in the path
router.get('/:salon_id', mobileStaffController.getStaffForSalon);

// Get staff details by staff ID
router.get('/staff-member/:id', mobileStaffController.getStaffById);

module.exports = router; 