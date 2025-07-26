const express = require("express");
const router = express.Router();
const checkPermission = require("../../../../middleware/permissionMiddleware");
const ownerProfileController = require("../../../../controllers/Api/salon/ownerProfileController");
const { createUploadMiddleware } = require("../../../../helpers/uploadHelper");

const uploadAvatar = createUploadMiddleware({
  uploadDir: "backend/public/uploads/avatars",
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 5 * 1024 * 1024, // 5MB
});

router.get(
  "/profile",
  checkPermission("salon", "edit"),
  ownerProfileController.getProfile
);
router.put(
  "/profile",
  checkPermission("salon", "edit"),
  ownerProfileController.updateProfile
);
router.patch(
  "/profile/avatar",
  checkPermission("salon", "edit"),
  uploadAvatar.single("avatar"),
  ownerProfileController.uploadAvatar
);
router.patch(
  "/profile/password",
  checkPermission("salon", "edit"),
  ownerProfileController.changePassword
);

module.exports = router;
