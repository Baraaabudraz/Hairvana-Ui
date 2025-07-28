const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  createUserValidation,
  updateUserValidation,
} = require("../validation/userValidation");
const validate = require("../middleware/validate");
const {
  authenticateToken,
  authorize,
  blockUserDashboard,
} = require("../middleware/authMiddleware");
const checkPermission = require("../middleware/permissionMiddleware");
const path = require("path");
const {
  createUploadMiddleware,
  getFileInfo,
  FILE_TYPE_MAP,
} = require("../helpers/uploadHelper");

// Directory for user avatars
const uploadDir = path.join(__dirname, "../public/uploads/avatars");
const allowedTypes = Object.keys(FILE_TYPE_MAP).filter((type) =>
  type.startsWith("image/")
);
const upload = createUploadMiddleware({
  uploadDir,
  maxSize: 5 * 1024 * 1024,
  allowedTypes,
});

// Protect all routes
router.use(authenticateToken);
router.use(blockUserDashboard());

// GET all users - admin only
router.get("/", checkPermission("users", "view"), userController.getAllUsers);

// GET user by ID
router.get("/:id", userController.getUserById);

// POST a new user with validation - admin only
router.post(
  "/",
  authorize("admin", "super admin"),
  upload.single("avatar"), // Accept avatar upload
  createUserValidation,
  validate,
  userController.createUser
);

// PUT (update) a user by ID with validation
router.put(
  "/:id",
  upload.single("avatar"), // Accept avatar upload
  updateUserValidation,
  validate,
  userController.updateUser
);

// DELETE a user by ID - super_admin only
router.delete(
  "/:id",
  checkPermission("users", "delete"),
  userController.deleteUser
);

// PATCH update user status - super_admin only
router.patch(
  "/:id/status",
  checkPermission("users", "edit"),
  userController.updateUserStatus
);

// POST /users/:id/avatar - upload or update user avatar
router.post("/:id/avatar", upload.single("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  // Optionally, update the user's avatar field in the database here
  // await userController.updateUserAvatar(req, res); // or similar logic
  const fileInfo = getFileInfo(req.file, "/uploads/avatars");
  res.json(fileInfo);
});

module.exports = router;
