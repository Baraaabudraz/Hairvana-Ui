const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class SecuritySettings extends Model {}
  SecuritySettings.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    twoFactorEnabled: {
      field: 'two_factor_enabled',
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    passwordLastChanged: {
      field: 'password_last_changed',
      type: DataTypes.DATE,
    },
    loginAttempts: {
      field: 'login_attempts',
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastLoginIp: {
      field: 'last_login_ip',
      type: DataTypes.TEXT,
    },
    allowedIps: {
      field: 'allowed_ips',
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    sessionTimeout: {
      field: 'session_timeout',
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'SecuritySettings',
    tableName: 'security_settings',
    timestamps: false,
    underscored: true,
  });
  return SecuritySettings;
}; 