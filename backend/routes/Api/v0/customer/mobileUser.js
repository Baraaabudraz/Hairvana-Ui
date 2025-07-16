const express = require('express');
const router = express.Router();
const mobileUserController = require('../../../../controllers/Api/customer/mobileUserController');
const { authenticateToken } = require('../../../../middleware/authMiddleware');
const { updateProfileValidation } = require('../../../../validation/mobileUserValidation');
const validate = require('../../../../middleware/validate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../../public/uploads/avatars');
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

router.get('/profile', authenticateToken, mobileUserController.getProfile);
router.put('/profile', authenticateToken, upload.single('avatar'), updateProfileValidation, validate, mobileUserController.updateProfile);

module.exports = router; 