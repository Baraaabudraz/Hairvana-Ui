const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, SalonOwner, Customer } = require('../models');
const authService = require('../services/authService');
const PermissionService = require("../services/permissionService");
// Remove destructuring for validateLogin, validateRegister, validateChangePassword
// const { validateLogin, validateRegister, validateChangePassword } = require('../validation/authValidation');
// Placeholder for future Supabase client usage
// const supabase = require('../lib/supabaseClient');

// Login
exports.login = async (req, res, next) => {
  try {
    // Validation handled by middleware
    const { user, token } = await authService.login(req.body);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
};

// Register
exports.register = async (req, res, next) => {
  try {
    // Validation handled by middleware
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ message: 'User registered successfully', user, token });
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res, next) => {
  try {
    await authService.logout(req.user);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    // Validation handled by middleware
    await authService.changePassword(req.user.userId, req.body);
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// Get user permissions
exports.getUserPermissions = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    const permissions = await PermissionService.getUserPermissions(userId);
    const accessibleResources = await PermissionService.getAccessibleResources(userId);
    const userRole = await PermissionService.getUserRole(userId);

    res.json({
      success: true,
      data: {
        permissions,
        accessibleResources,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Error getting user permissions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get user permissions' 
    });
  }
};