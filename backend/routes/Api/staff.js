const express = require('express');
const router = express.Router();
const mobileStaffController = require('../../controllers/Api/mobileStaffController');
const { protect } = require('../../middleware/authMiddleware');

router.use(protect);

// List staff for a salon by salon_id in the path
router.get('/:salon_id', mobileStaffController.getStaffForSalon);

// Get staff details by staff ID
router.get('/staff-member/:id', mobileStaffController.getStaffById);

module.exports = router; 