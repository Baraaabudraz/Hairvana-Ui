const express = require('express');
const router = express.Router();
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const salonController = require('../../../../controllers/Api/salon/salonController');
const { createUploadMiddleware } = require('../../../../helpers/uploadHelper');
const { createSalonValidation } = require('../../../../validation/salonValidation');
const validate = require('../../../../middleware/validate');

// Import revenue routes
const revenueRoutes = require('./revenue');

const uploadSalonFiles = createUploadMiddleware({
  uploadDir: '/salons',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxSize: 5 * 1024 * 1024 // 5MB per image
});

// Get all salons for the authenticated owner
router.get('/salons', authenticateOwner, salonController.getAllSalonsForOwner);

// Get salon by ID for the authenticated owner
router.get('/:id', authenticateOwner, salonController.getSalonById);

// Create a new salon for the authenticated owner
router.post('/create', 
  authenticateOwner, 
  uploadSalonFiles.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]), 
  createSalonValidation,
  validate,
  salonController.createSalon
);

// Delete a salon for the authenticated owner
router.delete('/:id', authenticateOwner, salonController.deleteSalon);

// Use revenue routes
router.use('/', revenueRoutes);

module.exports = router; 