const authRepository = require('../repositories/authRepository');
const bcrypt = require('bcryptjs');
const { Role, User } = require("../models");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { serializeUser } = require('../serializers/userSerializer');

// JWT token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set();

// Input validation helper
const validateInput = (data, requiredFields) => {
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
      throw Object.assign(new Error(`${field} is required`), { status: 400 });
    }
  }
};

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate password strength and return detailed feedback
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
exports.validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Secure JWT secret generation (use this once and store in environment)
const generateSecureSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

exports.login = async ({ email, password }) => {
  try {
    // Input validation
    validateInput({ email, password }, ['email', 'password']);
    
    if (!isValidEmail(email)) {
      throw Object.assign(new Error('Invalid email format'), { status: 400 });
    }

    // Normalize email
    email = email.toLowerCase().trim();

    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Use generic error message to prevent user enumeration
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    // Check if account is locked or inactive
    if (user.status !== 'active') {
      throw Object.assign(new Error('Account is inactive'), { status: 401 });
    }

    // REMOVED: Hardcoded admin password backdoor (CRITICAL SECURITY FIX)
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      // Log failed login attempt for monitoring
      console.log(`Failed login attempt for email: ${email} at ${new Date().toISOString()}`);
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    // Update last login
    await authRepository.updateLastLogin(user.id);

    // Extract role name safely
    const roleName = user.role?.name || 'user';

    // Use strong JWT secret from environment
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be set and at least 32 characters long');
    }

    // Create token with shorter expiration and additional claims
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: roleName,
        role_id: user.role_id,
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomUUID() // Unique token ID for blacklisting
      }, 
      jwtSecret, 
      { 
        expiresIn: '24h', // 24 hours for better user experience
        issuer: process.env.JWT_ISSUER || 'hairvana-api',
        audience: process.env.JWT_AUDIENCE || 'hairvana-mobile'
      }
    );

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user.toJSON();
    
    return { 
      user: userWithoutPassword, 
      token,
      expiresIn: 86400 // 24 hours in seconds
    };

  } catch (error) {
    // Log error for monitoring (don't expose internal details)
    console.error('Login error:', error.message);
    throw error;
  }
};

exports.register = async ({ name, email, password, role_id, phone }) => {
  try {
    // Input validation
    validateInput({ name, email, password }, ['name', 'email', 'password']);
    
    if (!isValidEmail(email)) {
      throw Object.assign(new Error('Invalid email format'), { status: 400 });
    }

    if (!isStrongPassword(password)) {
      throw Object.assign(new Error(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      ), { status: 400 });
    }

    // Normalize email
    email = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) {
      throw Object.assign(new Error('User with this email already exists'), { status: 409 });
    }

    // Validate role_id if provided
    if (role_id) {
      const validRole = await Role.findByPk(role_id);
      if (!validRole) {
        throw Object.assign(new Error('Invalid role'), { status: 400 });
      }
    }

    // Hash password with higher cost factor
    const salt = await bcrypt.genSalt(12); // Increased from 10
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await authRepository.createUser({ 
      email, 
      name: name.trim(), 
      phone: phone ? phone.trim() : null, 
      role_id: role_id || 1, // Default role
      status: 'active', 
      password_hash: passwordHash 
    });

    await authRepository.createRoleSpecific(newUser, role_id);

    // Extract role name safely
    const roleName = newUser.role?.name || 'user';

    // Use strong JWT secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be set and at least 32 characters long');
    }

    // Create token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        role: roleName,
        role_id: newUser.role_id,
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomUUID()
      }, 
      jwtSecret, 
      { 
        expiresIn: '24h', // 24 hours for better user experience
        issuer: process.env.JWT_ISSUER || 'hairvana-api',
        audience: process.env.JWT_AUDIENCE || 'hairvana-mobile'
      }
    );

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = newUser.toJSON();
    
    return { 
      user: userWithoutPassword, 
      token,
      expiresIn: 3600
    };

  } catch (error) {
    console.error('Registration error:', error.message);
    throw error;
  }
};

exports.logout = async (token) => {
  try {
    if (token) {
      // Decode token to get JTI for blacklisting
      const decoded = jwt.decode(token);
      if (decoded && decoded.jti) {
        tokenBlacklist.add(decoded.jti);
      }
    }
    return { message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error.message);
    // Don't throw error on logout
    return { message: 'Logged out successfully' };
  }
};

exports.getCurrentUser = async (userId) => {
  try {
    if (!userId) {
      throw Object.assign(new Error('User ID is required'), { status: 400 });
    }
    
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    // Use serializer to format user data with proper avatar URL
    const serializedUser = serializeUser(user, { 
      context: 'dashboard',
      avatarFilenameOnly: false // This will use buildAvatarUrl to create full URL
    });
    
    return serializedUser;
    
  } catch (error) {
    console.error('Get current user error:', error.message);
    throw error;
  }
};

exports.changePassword = async (userId, { currentPassword, newPassword }) => {
  try {
    // Input validation
    validateInput({ currentPassword, newPassword }, ['currentPassword', 'newPassword']);
    
    if (!isStrongPassword(newPassword)) {
      throw Object.assign(new Error(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      ), { status: 400 });
    }

    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw Object.assign(new Error('User not found'), { status: 404 });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw Object.assign(new Error('Current password is incorrect'), { status: 401 });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (isSamePassword) {
      throw Object.assign(new Error('New password must be different from current password'), { status: 400 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await authRepository.updatePassword(userId, hashedPassword);
    
    return { message: 'Password changed successfully' };
    
  } catch (error) {
    console.error('Change password error:', error.message);
    throw error;
  }
};

// Middleware to check if token is blacklisted
exports.isTokenBlacklisted = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded && decoded.jti && tokenBlacklist.has(decoded.jti);
  } catch (error) {
    return false;
  }
};

// Helper to validate JWT token
exports.validateToken = (token) => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Check if token is blacklisted
    if (exports.isTokenBlacklisted(token)) {
      throw new Error('Token has been revoked');
    }

    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'your-app-name',
      audience: 'your-app-users'
    });
    
    return decoded;
  } catch (error) {
    throw Object.assign(new Error('Invalid token'), { status: 401 });
  }
};

module.exports = exports;