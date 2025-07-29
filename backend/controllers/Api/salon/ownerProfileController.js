const userService = require('../../../services/userService');
const authService = require('../../../services/authService');
const { validationResult } = require('express-validator');

/**
 * Get owner profile
 * @route GET /api/v0/salon/owner-profile/profile
 * @access Private (Owner only)
 */
exports.getProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        error: 'User not authenticated' 
      });
    }

    const user = await userService.getUserById(req.user.id, req);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    return res.json({ 
      success: true, 
      message: 'Profile retrieved successfully',
      data: user 
    });
  } catch (error) {
    console.error('Owner Profile - Error:', error);
    return next(error);
  }
};

/**
 * Update owner profile
 * @route PUT /api/v0/salon/owner-profile/profile
 * @access Private (Owner only)
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, avatar } = req.body;
    const userId = req.user.id;

    // Check if user exists
    const existingUser = await userService.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await userService.checkEmailExists(email, userId);
      if (emailExists) {
        return res.status(409).json({ 
          success: false,
          error: 'Email already exists' 
        });
      }
    }

    // Update user profile
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await userService.updateUser(userId, updateData);

    return res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: updatedUser 
    });
  } catch (error) {
    console.error('Update Profile - Error:', error);
    return next(error);
  }
};

/**
 * Upload owner avatar
 * @route PATCH /api/v0/salon/owner-profile/profile/avatar
 * @access Private (Owner only)
 */
exports.uploadAvatar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No avatar file uploaded' 
      });
    }

    const userId = req.user.id;

    // Check if user exists
    const existingUser = await userService.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Upload avatar using service
    const avatarData = await userService.uploadAvatar(userId, req.file, req);

    return res.json({ 
      success: true, 
      message: 'Avatar uploaded successfully',
      data: avatarData 
    });
  } catch (error) {
    console.error('Upload Avatar - Error:', error);
    return next(error);
  }
};

/**
 * Change owner password
 * @route PATCH /api/v0/salon/owner-profile/profile/password
 * @access Private (Owner only)
 */
exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Old and new password are required' 
      });
    }

    // Validate password strength
    const passwordValidation = authService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false,
        error: 'Password does not meet requirements',
        details: passwordValidation.errors 
      });
    }

    // Change password using service
    await userService.changePassword(userId, oldPassword, newPassword);

    return res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Change Password - Error:', error);
    
    // Handle specific password-related errors
    if (error.message === 'Old password is incorrect') {
      return res.status(401).json({ 
        success: false,
        error: 'Old password is incorrect' 
      });
    }
    
    if (error.message === 'User not found') {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    return next(error);
  }
}; 