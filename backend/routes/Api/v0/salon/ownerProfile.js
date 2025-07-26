const express = require('express');
const router = express.Router();
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const ownerProfileController = require('../../../../controllers/Api/salon/ownerProfileController');
const { createUploadMiddleware } = require('../../../../helpers/uploadHelper');

const uploadAvatar = createUploadMiddleware({
  uploadDir: 'backend/public/uploads/avatars',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxSize: 5 * 1024 * 1024 // 5MB
});

router.get('/profile', authenticateOwner, ownerProfileController.getProfile);
router.put('/profile', authenticateOwner, ownerProfileController.updateProfile);
router.patch('/profile/avatar', authenticateOwner, uploadAvatar.single('avatar'), ownerProfileController.uploadAvatar);
router.patch('/profile/password', authenticateOwner, ownerProfileController.changePassword);

module.exports = router; 