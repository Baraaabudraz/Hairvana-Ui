const express = require("express");
const router = express.Router();
const checkPermission = require("../../../../middleware/permissionMiddleware");
const salonProfileController = require("../../../../controllers/Api/salon/salonProfileController");
const { createUploadMiddleware } = require("../../../../helpers/uploadHelper");

const uploadSalonImages = createUploadMiddleware({
  uploadDir: "backend/public/uploads/salons",
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 5 * 1024 * 1024, // 5MB per image
});

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
