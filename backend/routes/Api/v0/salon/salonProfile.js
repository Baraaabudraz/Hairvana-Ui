const express = require("express");
const router = express.Router();
const checkPermission = require("../../../../middleware/permissionMiddleware");
const salonProfileController = require("../../../../controllers/Api/salon/salonProfileController");
const { createUploadMiddleware } = require("../../../../helpers/uploadHelper");
const { updateSalonProfileValidation } = require('../../../../validation/salonValidation');
const validate = require('../../../../middleware/validate');

const uploadSalonFiles = createUploadMiddleware({
  uploadDir: "backend/public/uploads/salons",
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 5 * 1024 * 1024, // 5MB per image
});

// Get salon profile for the authenticated owner
router.get('/salon-profile', authenticateOwner, salonProfileController.getSalonProfile);

// Update salon profile for the authenticated owner
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
router.get(
  "/salon-profile",
  checkPermission("salon", "edit"),
  salonProfileController.getSalonProfile
);
router.put(
  "/salon-profile",
  checkPermission("salon", "edit"),
  uploadSalonImages.array("images", 5),
  salonProfileController.updateSalonProfile
);

module.exports = router;
