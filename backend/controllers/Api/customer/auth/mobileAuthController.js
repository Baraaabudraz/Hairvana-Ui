'use strict';
const { User, Customer, MobileDevice } = require('../../../../models');
const bcrypt = require('bcryptjs');
const TokenService = require('../../../../services/tokenService');

/**
 * Mobile Authentication Controller
 * Handles customer authentication with Passport JWT and token blacklisting
 */

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if email already exists
    const existing = await User.findOne({ 
      where: { email: email.toLowerCase().trim() } 
    });
    
    if (existing) {
      return res.status(409).json({ 
        error: 'Email already registered.',
        code: 'EMAIL_EXISTS'
      });
    }
    
    // Hash password
    const hash = await bcrypt.hash(password, 12); // Increased rounds for better security
    
    // Create user with customer role
    const userRole = await User.sequelize.models.Role.findOne({
      where: { name: "user" },
    });
    const user = await User.create({
      
      name: name.trim(), 
     
      email: email.toLowerCase().trim(), 
     
      password_hash: hash, 
     
      phone: phone?.trim(), 
     
      role_id: userRole ? customerRole.id : null,
      
      status: "active",
    
    });
    
    // Create customer profile
    await Customer.create({ user_id: user.id });
    
    // Generate token pair for immediate login after registration
    const tokenData = TokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    // Log successful registration
    console.log(`Customer registration successful - User: ${user.id}, Email: ${user.email}, IP: ${req.ip}`);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresIn: tokenData.expiresIn,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        phone: user.phone
      } 
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ 
      error: 'Registration failed.',
      code: 'REGISTRATION_ERROR'
    });
  }
};

/**
 * Login endpoint - uses Passport Local strategy via middleware
 * The actual authentication is handled by authenticateCustomerLocal middleware
 */
exports.login = async (req, res) => {
  try {
    // req.user and req.tokens are set by authenticateCustomerLocal middleware
    const user = req.user;
    const tokens = req.tokens;
    
    return res.json({ 
      success: true,
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        phone: user.phone,
        lastLogin: user.last_login
      } 
    });
  } catch (err) {
    console.error('Login response error:', err);
    return res.status(500).json({ 
      error: 'Login failed.',
      code: 'LOGIN_ERROR'
    });
  }
};

/**
 * Logout endpoint - revokes current token (accepts expired tokens)
 */
exports.logout = async (req, res) => {
  try {
    const { device_token } = req.body;
    const user = req.user; // From authenticateForLogout middleware
    
    // Extract token info for blacklisting
    const jti = req.tokenInfo?.jti;
    const isExpired = req.tokenInfo?.expired;
    
    console.log(`Logout attempt - User: ${user.id}, JTI: ${jti}, Token Info:`, req.tokenInfo);
    
    let blacklistResult = false;
    if (jti) {
      // Blacklist the current token (even if expired)
      const metadata = {
        deviceInfo: device_token ? { device_token } : null,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };
      
      blacklistResult = await TokenService.blacklistToken(jti, user.id, 'logout', metadata);
      console.log(`Token blacklisted on logout - User: ${user.id}, JTI: ${jti}, Expired: ${isExpired}, Result: ${blacklistResult}`);
      
      // Verify blacklisting worked
      const isNowBlacklisted = await TokenService.isTokenBlacklisted(jti);
      console.log(`Blacklist verification - JTI: ${jti}, Is blacklisted: ${isNowBlacklisted}`);
    } else {
      console.warn(`No JTI found for logout - User: ${user.id}, TokenInfo:`, req.tokenInfo);
    }
    
    // Remove device token if provided
    if (device_token) {
      await MobileDevice.destroy({ 
        where: { user_id: user.id, device_token: device_token } 
      });
      console.log(`Device token removed - User: ${user.id}, Device: ${device_token}`);
    }
    
    return res.json({ 
      success: true, 
      message: isExpired 
        ? 'Logged out successfully. Expired token processed.' 
        : 'Logged out successfully. Token has been revoked.',
      tokenWasExpired: isExpired,
      tokenBlacklisted: blacklistResult,
      revokedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Logout error:', err);
    console.error('Logout error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
    return res.status(500).json({ 
      error: 'Logout failed.',
      code: 'LOGOUT_ERROR',
      details: err.message // Add error details for debugging
    });
  }
};

/**
 * Logout from all devices (accepts expired tokens)
 */
exports.logoutAll = async (req, res) => {
  try {
    const user = req.user;
    const isExpired = req.tokenInfo?.expired;
    
    // Blacklist all tokens for this user
    const metadata = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    await TokenService.blacklistAllUserTokens(user.id, 'logout_all', metadata);
    
    // Remove all device tokens for user
    const deviceCount = await MobileDevice.destroy({ 
      where: { user_id: user.id } 
    });
    
    console.log(`All tokens revoked - User: ${user.id}, Devices removed: ${deviceCount}, Token was expired: ${isExpired}`);
    
    return res.json({ 
      success: true, 
      message: isExpired 
        ? 'Logged out from all devices successfully. Expired token processed.'
        : 'Logged out from all devices successfully.',
      tokenWasExpired: isExpired,
      devicesRevoked: deviceCount,
      revokedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Logout all error:', err);
    return res.status(500).json({ 
      error: 'Logout from all devices failed.',
      code: 'LOGOUT_ALL_ERROR'
    });
  }
};

/**
 * Refresh access token using refresh token
 */
exports.refresh = async (req, res) => {
  try {
    const user = req.user; // From refresh token middleware
    const oldJTI = user.tokenInfo?.jti;
    
    // Generate new access token
    const { token: newAccessToken, jti: newJTI } = TokenService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    }, '15m', 'access');
    
    // Optional: Blacklist the old refresh token to prevent reuse
    if (oldJTI) {
      await TokenService.blacklistToken(oldJTI, user.id, 'token_refresh', {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    
    console.log(`Token refreshed - User: ${user.id}, New JTI: ${newJTI}`);
    
    return res.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: 900, // 15 minutes
      refreshedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    return res.status(500).json({ 
      error: 'Token refresh failed.',
      code: 'REFRESH_ERROR'
    });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = req.user; // From Passport JWT middleware
    
    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        joinDate: user.join_date,
        lastLogin: user.last_login,
        preferences: user.preferences
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch profile.',
      code: 'PROFILE_ERROR'
    });
  }
};

/**
 * Change password (requires current password)
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Current password is incorrect.',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }
    
    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await User.update(
      { password_hash: newHash },
      { where: { id: user.id } }
    );
    
    // Blacklist all existing tokens for security
    await TokenService.blacklistAllUserTokens(user.id, 'password_change', {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    // Remove all device tokens
    await MobileDevice.destroy({ where: { user_id: user.id } });
    
    console.log(`Password changed - User: ${user.id}, All tokens revoked`);
    
    return res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
      allTokensRevoked: true
    });
  } catch (err) {
    console.error('Password change error:', err);
    return res.status(500).json({ 
      error: 'Password change failed.',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
};

/**
 * Get user's token audit log
 */
exports.getTokenAudit = async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 10;
    
    const auditLog = await TokenService.getUserBlacklistedTokens(user.id, limit);
    
    return res.json({
      success: true,
      auditLog: auditLog.map(entry => ({
        tokenType: entry.token_type,
        reason: entry.reason,
        revokedAt: entry.revoked_at,
        deviceInfo: entry.device_info
      }))
    });
  } catch (err) {
    console.error('Token audit fetch error:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch token audit.',
      code: 'AUDIT_ERROR'
    });
  }
};
