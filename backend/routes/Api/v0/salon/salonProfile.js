const express = require('express');
const router = express.Router();
const { authenticateOwner } = require('../../../../middleware/authMiddleware');
const salonProfileController = require('../../../../controllers/Api/salon/salonProfileController');
const { createUploadMiddleware } = require('../../../../helpers/uploadHelper');

const uploadSalonImages = createUploadMiddleware({
  uploadDir: 'backend/public/uploads/salons',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxSize: 5 * 1024 * 1024 // 5MB per image
});

router.get('/salon-profile', authenticateOwner, salonProfileController.getSalonProfile);
router.put('/salon-profile', authenticateOwner, uploadSalonImages.array('images', 5), salonProfileController.updateSalonProfile);

module.exports = router; 