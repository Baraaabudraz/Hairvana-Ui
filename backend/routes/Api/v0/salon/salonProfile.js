const express = require('express');
const router = express.Router();
const { authenticateOwner } = require('../../../../middleware/authMiddleware');
const salonProfileController = require('../../../../controllers/Api/salon/salonProfileController');
const { createUploadMiddleware } = require('../../../../helpers/uploadHelper');
const { updateSalonProfileValidation } = require('../../../../validation/salonValidation');
const validate = require('../../../../middleware/validate');

const uploadSalonFiles = createUploadMiddleware({
  uploadDir: 'backend/public/uploads/salons',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxSize: 5 * 1024 * 1024 // 5MB per image
});

router.get('/salon-profile', authenticateOwner, salonProfileController.getSalonProfile);
router.put('/salon-profile', 
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