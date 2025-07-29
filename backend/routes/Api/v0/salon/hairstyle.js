const express = require("express");
const router = express.Router();
const { authenticateOwner, authenticateJWT } = require('../../../../middleware/passportMiddleware');
const checkPermission = require("../../../../middleware/permissionMiddleware");
const hairstyleController = require("../../../../controllers/Api/salon/hairstyleController");
const { createUploadMiddleware } = require("../../../../helpers/uploadHelper");
const {
  createHairstyleValidation,
  updateHairstyleValidation,
} = require("../../../../validation/hairstyleValidation");

const uploadHairstyle = createUploadMiddleware({
  uploadDir: "backend/public/uploads/hairstyles/original",
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 5 * 1024 * 1024, // 5MB
});

// Upload a new hairstyle
router.post(
  "/hairstyles",
  authenticateOwner,
  checkPermission("salon", "add"),
  uploadHairstyle.single("image"),
  createHairstyleValidation,
  hairstyleController.uploadHairstyle
);
// List all hairstyles
router.get(
  "/hairstyles",
  authenticateOwner,
  hairstyleController.getHairstyles
);
// Update a hairstyle
router.put(
  "/hairstyles/:id",
  authenticateOwner,
  checkPermission("salon", "edit"),
  uploadHairstyle.single("image"),
  updateHairstyleValidation,
  hairstyleController.updateHairstyle
);
// Delete a hairstyle
router.delete(
  "/hairstyles/:id",
  authenticateOwner,
  checkPermission("salon", "delete"),
  hairstyleController.deleteHairstyle
);

module.exports = router;
