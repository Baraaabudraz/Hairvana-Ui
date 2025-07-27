'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class TokenBlacklist extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      TokenBlacklist.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }

    /**
     * Check if a token is expired based on its original expiration
     */
    isExpired() {
      return new Date() > this.expires_at;
    }

    /**
     * Get formatted revocation info
     */
    getRevocationInfo() {
      return {
        reason: this.reason,
        revokedAt: this.revoked_at,
        deviceInfo: this.device_info
      };
    }
  }
  
  TokenBlacklist.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    token_jti: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 255]
      },
      comment: 'JWT ID (jti) claim for unique token identification'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
      // Removed isUUID validation to allow seeded user IDs
    },
    token_type: {
      type: DataTypes.ENUM('access', 'refresh'),
      allowNull: false,
      defaultValue: 'access',
      validate: {
        isIn: [['access', 'refresh']]
      }
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true
      }
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterRevocation(value) {
          if (this.revoked_at && value < this.revoked_at) {
            throw new Error('Token expiration must be after revocation time');
          }
        }
      },
      comment: 'Original token expiration time'
    },
    reason: {
      type: DataTypes.ENUM('logout', 'logout_all', 'password_change', 'security_breach', 'admin_revoke', 'token_refresh'),
      allowNull: false,
      defaultValue: 'logout',
      validate: {
        isIn: [['logout', 'logout_all', 'password_change', 'security_breach', 'admin_revoke', 'token_refresh']]
      }
    },
    device_info: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Device information for tracking and audit purposes'
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true,
      comment: 'IP address from which the token was revoked'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent string for audit purposes'
    }
  }, {
    sequelize,
    modelName: 'TokenBlacklist',
    tableName: 'token_blacklist',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: 'token_blacklist_jti_idx',
        fields: ['token_jti'],
        unique: true
      },
      {
        name: 'token_blacklist_user_id_idx',
        fields: ['user_id']
      },
      {
        name: 'token_blacklist_expires_at_idx',
        fields: ['expires_at']
      },
      {
        name: 'token_blacklist_revoked_at_idx',
        fields: ['revoked_at']
      },
      {
        name: 'token_blacklist_user_type_idx',
        fields: ['user_id', 'token_type']
      }
    ],
    hooks: {
      beforeValidate: (tokenBlacklist) => {
        // Ensure revoked_at is not in the future
        if (tokenBlacklist.revoked_at > new Date()) {
          tokenBlacklist.revoked_at = new Date();
        }
      }
    }
  });
  
  return TokenBlacklist;
}; 