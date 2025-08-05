const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const emailService = require('./emailService');

/**
 * Password Reset Service - Handles password reset tokens and validation
 */
class PasswordResetService {
  
  /**
   * Generate a secure reset token
   * @returns {string} Reset token
   */
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash reset token for storage
   * @param {string} token - Reset token
   * @returns {string} Hashed token
   */
  async hashResetToken(token) {
    return await bcrypt.hash(token, 10);
  }

  /**
   * Verify reset token
   * @param {string} token - Reset token
   * @param {string} hashedToken - Hashed token from database
   * @returns {boolean} True if token is valid
   */
  async verifyResetToken(token, hashedToken) {
    return await bcrypt.compare(token, hashedToken);
  }

  /**
   * Request password reset for customer
   * @param {string} email - User's email
   * @returns {Promise<Object>} Result object
   */
  async requestCustomerPasswordReset(email) {
    try {
      // Find user by email
      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() },
        include: [
          { model: User.sequelize.models.Role, as: 'role' }
        ]
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return { success: true, message: 'If an account with this email exists, a password reset link has been sent.' };
      }

      // Check if user is a customer
      const roleName = user.role?.name || '';
      if (!roleName.toLowerCase().includes('customer') && !roleName.toLowerCase().includes('user')) {
        return { success: false, message: 'This email is not associated with a customer account.' };
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      const hashedToken = await this.hashResetToken(resetToken);

      // Store reset token in user record
      await User.update({
        reset_token: hashedToken,
        reset_token_expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }, {
        where: { id: user.id }
      });

      // Send reset email
      const resetUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        `${resetUrl}/reset-password`,
        user.name
      );

      if (emailSent) {
        console.log(`Password reset requested for customer: ${user.email}`);
        return { 
          success: true, 
          message: 'Password reset link has been sent to your email address.' 
        };
      } else {
        // If email fails, remove the token
        await User.update({
          reset_token: null,
          reset_token_expires: null
        }, {
          where: { id: user.id }
        });
        
        return { 
          success: false, 
          message: 'Failed to send password reset email. Please try again later.' 
        };
      }

    } catch (error) {
      console.error('Customer password reset request error:', error);
      return { 
        success: false, 
        message: 'An error occurred while processing your request. Please try again.' 
      };
    }
  }

  /**
   * Request password reset for salon owner
   * @param {string} email - User's email
   * @returns {Promise<Object>} Result object
   */
  async requestSalonPasswordReset(email) {
    try {
      // Find user by email
      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() },
        include: [
          { model: User.sequelize.models.Role, as: 'role' }
        ]
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return { success: true, message: 'If an account with this email exists, a password reset link has been sent.' };
      }

      // Check if user is a salon owner
      const roleName = user.role?.name || '';
      if (!roleName.toLowerCase().includes('salon') && !roleName.toLowerCase().includes('owner')&& !roleName.toLowerCase().includes('salon owner')) {
        return { success: false, message: 'This email is not associated with a salon owner account.' };
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      const hashedToken = await this.hashResetToken(resetToken);

      // Store reset token in user record
      await User.update({
        reset_token: hashedToken,
        reset_token_expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      }, {
        where: { id: user.id }
      });

      // Send reset email
      const resetUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        `${resetUrl}/salon/reset-password`,
        user.name
      );

      if (emailSent) {
        console.log(`Password reset requested for salon owner: ${user.email}`);
        return { 
          success: true, 
          message: 'Password reset link has been sent to your email address.' 
        };
      } else {
        // If email fails, remove the token
        await User.update({
          reset_token: null,
          reset_token_expires: null
        }, {
          where: { id: user.id }
        });
        
        return { 
          success: false, 
          message: 'Failed to send password reset email. Please try again later.' 
        };
      }

    } catch (error) {
      console.error('Salon password reset request error:', error);
      return { 
        success: false, 
        message: 'An error occurred while processing your request. Please try again.' 
      };
    }
  }

  /**
   * Reset password using token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result object
   */
  async resetPassword(token, newPassword) {
    try {
      // Find user with valid reset token
      const user = await User.findOne({
        where: {
          reset_token: { [User.sequelize.Sequelize.Op.ne]: null },
          reset_token_expires: { [User.sequelize.Sequelize.Op.gt]: new Date() }
        }
      });

      if (!user) {
        return { 
          success: false, 
          message: 'Invalid or expired reset token. Please request a new password reset.' 
        };
      }

      // Verify the token
      const isValidToken = await this.verifyResetToken(token, user.reset_token);
      if (!isValidToken) {
        return { 
          success: false, 
          message: 'Invalid reset token. Please request a new password reset.' 
        };
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      await User.update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null
      }, {
        where: { id: user.id }
      });

      console.log(`Password reset successful for user: ${user.email}`);
      return { 
        success: true, 
        message: 'Password has been reset successfully. You can now log in with your new password.' 
      };

    } catch (error) {
      console.error('Password reset error:', error);
      return { 
        success: false, 
        message: 'An error occurred while resetting your password. Please try again.' 
      };
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  validatePasswordStrength(password) {
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
  }
}

module.exports = new PasswordResetService(); 