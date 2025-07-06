const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createUserValidation, updateUserValidation } = require('../validation/userValidation');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

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