const express = require("express");
const router = express.Router();
const ownerProfileController = require("../../../../controllers/Api/salon/ownerProfileController");
const { createUploadMiddleware } = require("../../../../helpers/uploadHelper");
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const { passwordChangeRateLimit } = require('../../../../middleware/rateLimitMiddleware');
const { 
  getProfileValidation, 
  updateProfileValidation, 
  uploadAvatarValidation, 
  changePasswordValidation 
} = require('../../../../validation/ownerProfileValidation');
const validate = require('../../../../middleware/validate');

const uploadAvatar = createUploadMiddleware({
  uploadDir: "/avatars",
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 5 * 1024 * 1024, // 5MB
});

router.get(
  "/profile",
  authenticateOwner,
  getProfileValidation,
  validate,
  ownerProfileController.getProfile
);
router.put(
  "/profile",
  authenticateOwner,
  updateProfileValidation,
  validate,
  ownerProfileController.updateProfile
);
router.patch(
  "/profile/avatar",
  uploadAvatar.single("avatar"),
  authenticateOwner,
  uploadAvatarValidation,
  validate,
  ownerProfileController.uploadAvatar
);
router.patch(
  "/profile/password",
  passwordChangeRateLimit,
  authenticateOwner,
  changePasswordValidation,
  validate,
  ownerProfileController.changePassword
);

module.exports = router;
