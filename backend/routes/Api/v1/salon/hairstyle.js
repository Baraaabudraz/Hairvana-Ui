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
  uploadDir: "/hairstyles",
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 5 * 1024 * 1024, // 5MB
});

// Upload a new hairstyle
router.post(
  "/create",
  authenticateOwner,
  uploadHairstyle.single("image"),
  createHairstyleValidation,
  hairstyleController.uploadHairstyle
);

// List all hairstyles for a specific salon
router.get(
  "/:salonId/hairstyles",
  authenticateOwner,
  hairstyleController.getHairstyles
);

// Update a hairstyle for a specific salon
router.put(
  "/salon/:salonId/hairstyle/:id",
  authenticateOwner,
  uploadHairstyle.single("image"),
  updateHairstyleValidation,
  hairstyleController.updateHairstyle
);

// Delete a hairstyle for a specific salon
router.delete(
  "/salon/:salonId/hairstyle/:id",
  authenticateOwner,
  hairstyleController.deleteHairstyle
);



module.exports = router;
