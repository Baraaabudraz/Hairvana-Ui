const express = require("express");
const router = express.Router();
const checkPermission = require("../../../../middleware/permissionMiddleware");
const ownerProfileController = require("../../../../controllers/Api/salon/ownerProfileController");
const { createUploadMiddleware } = require("../../../../helpers/uploadHelper");
const { authenticateOwner } = require('../../../../middleware/passportMiddleware');
const { passwordChangeRateLimit } = require('../../../../middleware/rateLimitMiddleware');

const uploadAvatar = createUploadMiddleware({
  uploadDir: "backend/public/uploads/avatars",
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 5 * 1024 * 1024, // 5MB
});

router.get(
  "/profile",
  authenticateOwner,
  ownerProfileController.getProfile
);
router.put(
  "/profile",
  authenticateOwner,
  ownerProfileController.updateProfile
);
router.patch(
  "/profile/avatar",
  uploadAvatar.single("avatar"),
  authenticateOwner,
  ownerProfileController.uploadAvatar
);
router.patch(
  "/profile/password",
  passwordChangeRateLimit,
  authenticateOwner,
  ownerProfileController.changePassword
);

module.exports = router;
