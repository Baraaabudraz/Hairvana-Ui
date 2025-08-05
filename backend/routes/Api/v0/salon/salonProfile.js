const express = require('express');
const router = express.Router();
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const salonProfileController = require('../../../../controllers/Api/salon/salonProfileController');
const { createUploadMiddleware } = require('../../../../helpers/uploadHelper');
const { updateSalonProfileValidation } = require('../../../../validation/salonValidation');
const validate = require('../../../../middleware/validate');

const uploadSalonFiles = createUploadMiddleware({
  uploadDir: '/public/uploads/salons',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxSize: 5 * 1024 * 1024 // 5MB per image
});

// Get salon profile for the authenticated owner
router.get('/:id/salon-profile', authenticateOwner, salonProfileController.getSalonProfile);

// Update salon profile for the authenticated owner
router.put('/:id/salon-profile', 
  authenticateOwner, 
  uploadSalonFiles.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]), 
  updateSalonProfileValidation,
  validate,
  salonProfileController.updateSalonProfile
);

module.exports = router; 