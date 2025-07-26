const express = require("express");
const router = express.Router();
const { createUploadMiddleware } = require("../../../../helpers/uploadHelper");
const ownerAuthController = require("../../../../controllers/Api/salon/auth/ownerAuthController");
const ownerProfileController = require("../../../../controllers/Api/salon/ownerProfileController");
const checkPermission = require("../../../../middleware/permissionMiddleware");

// Multer setup for file uploads using uploadHelper
const upload = createUploadMiddleware({
  uploadDir: "backend/public/uploads/owner_docs",
  allowedTypes: ["image/jpeg", "image/png", "application/pdf"],
  maxSize: 10 * 1024 * 1024, // 10MB
});

const uploadAvatar = createUploadMiddleware({
  uploadDir: "backend/public/uploads/avatars",
  allowedTypes: ["image/jpeg", "image/png"],
  maxSize: 5 * 1024 * 1024, // 5MB
});

// Register
router.post("/register", upload.none(), ownerAuthController.register);

// Login
router.post("/login", ownerAuthController.login);

// Logout
router.post(
  "/logout",
  checkPermission("salon", "edit"),
  ownerAuthController.logout
);

// Upload documents
router.post(
  "/upload-documents",
  checkPermission("salon", "edit"),
  upload.fields([
    { name: "commercial_registration", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  ownerAuthController.uploadDocuments
);

module.exports = router;
