const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { createStaffValidation, updateStaffValidation } = require('../validation/staffValidation');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// GET all staff
router.get('/', staffController.getAllStaff);

// GET staff by ID
router.get('/:id', staffController.getStaffById);

// POST a new staff member with validation
router.post('/', createStaffValidation, validate, staffController.createStaff);

// PUT (update) a staff member by ID with validation
router.put('/:id', updateStaffValidation, validate, staffController.updateStaff);

// DELETE a staff member by ID
router.delete('/:id', staffController.deleteStaff);

// POST assign service to staff
router.post('/:id/services', staffController.assignService);

// DELETE remove service from staff
router.delete('/:id/services/:serviceId', staffController.removeService);

module.exports = router;