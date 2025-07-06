const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const { createSalonValidation, updateSalonValidation } = require('../validation/salonValidation');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// GET all salons
router.get('/', salonController.getAllSalons);

// GET salon by ID
router.get('/:id', salonController.getSalonById);

// POST a new salon with validation
router.post('/', createSalonValidation, validate, salonController.createSalon);

// PUT (update) a salon by ID with validation
router.put('/:id', updateSalonValidation, validate, salonController.updateSalon);

// DELETE a salon by ID - admin only
router.delete('/:id', authorize('admin', 'super_admin'), salonController.deleteSalon);

// PATCH update salon status - admin only
router.patch('/:id/status', authorize('admin', 'super_admin'), salonController.updateSalonStatus);

// GET salon services
router.get('/:id/services', salonController.getSalonServices);

// GET salon staff
router.get('/:id/staff', salonController.getSalonStaff);

// GET salon appointments
router.get('/:id/appointments', salonController.getSalonAppointments);

module.exports = router;