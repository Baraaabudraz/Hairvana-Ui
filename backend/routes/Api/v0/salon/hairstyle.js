const express = require('express');
const router = express.Router();
const { authenticateOwner } = require('../../../../middleware/authMiddleware');
const hairstyleController = require('../../../../controllers/Api/salon/hairstyleController');
const { createUploadMiddleware } = require('../../../../helpers/uploadHelper');

const uploadHairstyle = createUploadMiddleware({
  uploadDir: 'backend/public/uploads/hairstyles/original',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxSize: 5 * 1024 * 1024 // 5MB
});

// Upload a new hairstyle
router.post('/hairstyles', authenticateOwner, uploadHairstyle.single('image'), hairstyleController.validateHairstyle, hairstyleController.uploadHairstyle);
// List all hairstyles
router.get('/hairstyles', authenticateOwner, hairstyleController.getHairstyles);
// Update a hairstyle
router.put('/hairstyles/:id', authenticateOwner, uploadHairstyle.single('image'), hairstyleController.validateHairstyle, hairstyleController.updateHairstyle);
// Delete a hairstyle
router.delete('/hairstyles/:id', authenticateOwner, hairstyleController.deleteHairstyle);

module.exports = router; 