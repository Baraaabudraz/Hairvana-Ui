const express = require('express');
const router = express.Router();
const hairstyleTryOnController = require('../../../../controllers/Api/customer/hairstyleTryOnController');
const { authenticateCustomer } = require('../../../../middleware/passportMiddleware');
const { createUploadMiddleware } = require('../../../../helpers/uploadHelper');

// Upload middleware for customer photos
const uploadCustomerPhoto = createUploadMiddleware({
  uploadDir: "/customer-tryon",
  allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
  maxSize: 10 * 1024 * 1024, // 10MB
});

// Get available hairstyles from YouCam (temporarily public for testing)
router.get('/available', hairstyleTryOnController.getAvailableHairstyles);

// Get hairstyle categories (temporarily public for testing)
router.get('/categories', hairstyleTryOnController.getHairstyleCategories);

// Get hairstyle groups (temporarily public for testing)
router.get('/groups', hairstyleTryOnController.getHairstyleGroups);

// Try on a specific hairstyle
router.post('/try-on', authenticateCustomer, uploadCustomerPhoto.single('photo'), hairstyleTryOnController.tryOnHairstyle);

// Generate multiple hairstyle variations
router.post('/generate-variations', authenticateCustomer, uploadCustomerPhoto.single('photo'), hairstyleTryOnController.generateHairstyleVariations);

module.exports = router;