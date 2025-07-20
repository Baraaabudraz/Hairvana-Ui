const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const { createSalonValidation, updateSalonValidation } = require('../validation/salonValidation');
const validate = require('../middleware/validate');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { createUploadMiddleware } = require('../helpers/uploadHelper');
const path = require('path');
const uploadDir = path.join(__dirname, '../public/uploads/salons');
const upload = createUploadMiddleware({ uploadDir, maxSize: 5 * 1024 * 1024, allowedTypes: ['image/jpeg', 'image/png', 'image/gif'] });

// Protect all routes
router.use(authenticateToken);

// GET all salons
router.get('/', salonController.getAllSalons);

// GET salon by ID
router.get('/:id', salonController.getSalonById);

// POST a new salon with validation
router.post('/',
  authorize('admin', 'super_admin'),
  upload.array('images', 5), // Accept up to 5 images in the 'images' field
  (req, res, next) => {
    if (req.body.images && !Array.isArray(req.body.images)) {
      req.body.images = [req.body.images];
    }
    next();
  },
  createSalonValidation,
  validate,
  salonController.createSalon
);

// PUT (update) a salon by ID with validation
router.put('/:id',
  upload.array('images', 5), // Accept up to 5 images in the 'images' field
  (req, res, next) => {
    if (req.body.images && !Array.isArray(req.body.images)) {
      req.body.images = [req.body.images];
    }
    next();
  },
  updateSalonValidation,
  validate,
  salonController.updateSalon
);

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