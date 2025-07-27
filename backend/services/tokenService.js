const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { TokenBlacklist, User } = require('../models');
const { Op } = require('sequelize');

/**
 * TokenService - Handles JWT token generation, validation, and blacklisting
 * Implements security best practices for token management
 */
class TokenService {
  
  /**
   * Generate JWT token with unique JTI (JWT ID)
   * @param {Object} payload - User data to include in token
   * @param {string} expiresIn - Token expiration time (default: '7d')
   * @param {string} tokenType - Type of token ('access' or 'refresh')
   * @returns {Object} { token, jti, expiresAt }
   */
  static generateToken(payload, expiresIn = '7d', tokenType = 'access') {
    try {
      const jti = uuidv4(); // Unique token identifier
      const issuedAt = Math.floor(Date.now() / 1000);
      const expiresAtTimestamp = this.calculateExpirationTimestamp(expiresIn, issuedAt);
      
      const tokenPayload = {
        ...payload,
        jti,
        iat: issuedAt,
        exp: expiresAtTimestamp,
        type: tokenType,
        // Add additional security claims
        iss: process.env.JWT_ISSUER || 'hairvana-api',
        aud: process.env.JWT_AUDIENCE || 'hairvana-mobile'
      };
      
      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { 
          algorithm: 'HS256' // Explicitly set algorithm for security
          // Don't use expiresIn since we're setting exp manually
        }
      );
      
      return { 
        token, 
        jti, 
        expiresAt: new Date(expiresAtTimestamp * 1000),
        tokenType 
      };
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Generate access and refresh token pair
   * @param {Object} payload - User data
   * @returns {Object} { accessToken, refreshToken, accessTokenInfo, refreshTokenInfo }
   */
  static generateTokenPair(payload) {
    const accessTokenInfo = this.generateToken(payload, '15m', 'access');
    const refreshTokenInfo = this.generateToken(payload, '7d', 'refresh');
    
    return {
      accessToken: accessTokenInfo.token,
      refreshToken: refreshTokenInfo.token,
      accessTokenInfo,
      refreshTokenInfo,
      expiresIn: 900 // 15 minutes in seconds
    };
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: process.env.JWT_ISSUER || 'hairvana-api',
        audience: process.env.JWT_AUDIENCE || 'hairvana-mobile'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Check if token is blacklisted
   * @param {string} jti - JWT ID to check
   * @returns {boolean} True if token is blacklisted
   */
  static async isTokenBlacklisted(jti) {
    try {
      if (!jti) return false;
      
      const blacklistedToken = await TokenBlacklist.findOne({
        where: { 
          token_jti: jti,
          // Only check non-expired blacklisted tokens for performance
          expires_at: {
            [Op.gt]: new Date()
          }
        },
        attributes: ['id'] // Only fetch id for performance
      });
      
      return !!blacklistedToken;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      // Fail safely - if we can't check blacklist, assume token is valid
      return false;
    }
  }

  /**
   * Blacklist a single token
   * @param {string} jti - JWT ID to blacklist
   * @param {string} userId - User ID who owns the token
   * @param {string} reason - Reason for blacklisting
   * @param {Object} metadata - Additional metadata (IP, user agent, device info)
   * @returns {boolean} Success status
   */
  static async blacklistToken(jti, userId, reason = 'logout', metadata = {}) {
    // Declare variables at function scope to avoid reference errors in catch block
    let expiresAt;
    let actualJTI = jti;
    
    try {
      // Extract expiration from JTI if it's actually a full token
      try {
        const decoded = jwt.decode(jti);
        if (decoded && decoded.exp) {
          expiresAt = new Date(decoded.exp * 1000);
          actualJTI = decoded.jti; // Use the actual JTI from the token
        }
      } catch (decodeError) {
        // If decode fails, assume jti is already the JTI string
        console.log('JTI decode failed, using as-is');
      }
      
      // If we still don't have expiration, set a default
      if (!expiresAt) {
        expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // Default 7 days
      }

      console.log(`Attempting to blacklist token - JTI: ${actualJTI}, User: ${userId}, ExpiresAt: ${expiresAt}`);
      
      const blacklistEntry = await TokenBlacklist.create({
        token_jti: actualJTI,
        user_id: userId,
        reason,
        expires_at: expiresAt,
        device_info: metadata.deviceInfo || null,
        ip_address: metadata.ipAddress || null,
        user_agent: metadata.userAgent || null
      });
      
      console.log(`Token blacklisted successfully - JTI: ${actualJTI}, User: ${userId}, Reason: ${reason}, ID: ${blacklistEntry.id}`);
      return true;
    } catch (error) {
      console.error('Error blacklisting token:', error);
      console.error('Error details:', {
        jti: actualJTI || jti,
        userId,
        reason,
        expiresAt,
        metadata,
        errorMessage: error.message,
        errorCode: error.code,
        errorName: error.name
      });
      return false;
    }
  }

  /**
   * Blacklist all tokens for a user
   * @param {string} userId - User ID
   * @param {string} reason - Reason for blacklisting
   * @param {Object} metadata - Additional metadata
   * @returns {number} Number of tokens blacklisted
   */
  static async blacklistAllUserTokens(userId, reason = 'logout_all', metadata = {}) {
    try {
      // This is a complex operation since we don't store all active tokens
      // We'll implement a user token version approach in the User model
      
      // First, increment user's token version (if implemented)
      await User.increment('token_version', { 
        where: { id: userId },
        silent: true 
      });

      // For now, we'll create a special blacklist entry that invalidates all tokens
      // issued before this timestamp
      const now = new Date();
      await TokenBlacklist.create({
        token_jti: `all_tokens_${userId}_${now.getTime()}`,
        user_id: userId,
        reason,
        expires_at: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)), // 30 days
        device_info: { ...metadata.deviceInfo, type: 'all_tokens_revocation' },
        ip_address: metadata.ipAddress || null,
        user_agent: metadata.userAgent || null
      });

      console.log(`All tokens blacklisted for user: ${userId}, Reason: ${reason}`);
      return 1; // Return 1 to indicate success
    } catch (error) {
      console.error('Error blacklisting all user tokens:', error);
      return 0;
    }
  }

  /**
   * Clean up expired blacklisted tokens
   * Should be run as a scheduled job
   * @returns {number} Number of tokens cleaned up
   */
  static async cleanupExpiredTokens() {
    try {
      const now = new Date();
      const result = await TokenBlacklist.destroy({
        where: {
          expires_at: {
            [Op.lt]: now
          }
        }
      });
      
      if (result > 0) {
        console.log(`Cleaned up ${result} expired blacklisted tokens`);
      }
      
      return result;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  /**
   * Get blacklisted tokens for a user (for audit purposes)
   * @param {string} userId - User ID
   * @param {number} limit - Number of records to return
   * @returns {Array} Array of blacklisted tokens
   */
  static async getUserBlacklistedTokens(userId, limit = 10) {
    try {
      return await TokenBlacklist.findAll({
        where: { user_id: userId },
        order: [['revoked_at', 'DESC']],
        limit,
        attributes: [
          'token_jti', 'token_type', 'reason', 
          'revoked_at', 'expires_at', 'device_info'
        ]
      });
    } catch (error) {
      console.error('Error fetching user blacklisted tokens:', error);
      return [];
    }
  }

  /**
   * Validate token and check blacklist
   * @param {string} token - JWT token to validate
   * @returns {Object} { valid: boolean, payload?: Object, error?: string }
   */
  static async validateToken(token) {
    try {
      // First verify the token signature and structure
      const payload = this.verifyToken(token);
      
      // Check if token is blacklisted
      if (payload.jti) {
        const isBlacklisted = await this.isTokenBlacklisted(payload.jti);
        if (isBlacklisted) {
          return { 
            valid: false, 
            error: 'Token has been revoked',
            code: 'TOKEN_REVOKED'
          };
        }
      }
      
      return { valid: true, payload };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message,
        code: error.message.includes('expired') ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
      };
    }
  }

  /**
   * Helper method to calculate expiration timestamp
   * @param {string} expiresIn - Time string (e.g., '7d', '15m')
   * @param {number} issuedAt - Issued at timestamp
   * @returns {number} Expiration timestamp
   */
  static calculateExpirationTimestamp(expiresIn, issuedAt) {
    const timeUnits = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800
    };
    
    const match = expiresIn.match(/^(\d+)([smhdw])$/);
    if (!match) {
      throw new Error('Invalid expiresIn format');
    }
    
    const [, amount, unit] = match;
    const seconds = parseInt(amount) * timeUnits[unit];
    
    return issuedAt + seconds;
  }

  /**
   * Extract JTI from token without verification
   * @param {string} token - JWT token
   * @returns {string|null} JTI or null if not found
   */
  static extractJTI(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded?.jti || null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = TokenService; 