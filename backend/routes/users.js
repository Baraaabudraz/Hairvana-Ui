const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createUserValidation, updateUserValidation } = require('../validation/userValidation');
const validate = require('../middleware/validate');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/avatars');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Protect all routes
router.use(authenticateToken);

// GET all users - admin only
router.get('/', authorize('admin', 'super_admin'), userController.getAllUsers);

// GET user by ID
router.get('/:id', userController.getUserById);

// POST a new user with validation - admin only
router.post('/', authorize('admin', 'super_admin'), createUserValidation, validate, userController.createUser);

// PUT (update) a user by ID with validation
router.put('/:id', updateUserValidation, validate, userController.updateUser);

// DELETE a user by ID - admin only
router.delete('/:id', authorize('admin', 'super_admin'), userController.deleteUser);

// PATCH update user status - admin only
router.patch('/:id/status', authorize('admin', 'super_admin'), userController.updateUserStatus);

module.exports = router;