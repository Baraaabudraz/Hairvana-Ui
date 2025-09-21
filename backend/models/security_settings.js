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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password_last_changed: {
      type: DataTypes.DATE,
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_login_ip: {
      type: DataTypes.TEXT,
    },
    allowed_ips: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
    session_timeout: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    password_expiry_days: {
      type: DataTypes.INTEGER,
      defaultValue: 90,
      allowNull: true,
    },
    data_retention_period: {
      type: DataTypes.INTEGER,
      defaultValue: 365,
      allowNull: true,
    },
    ssl_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
    encryption_level: {
      type: DataTypes.STRING,
      defaultValue: 'AES-256',
      allowNull: true,
    },
    audit_logging: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: true,
    },
    backup_frequency: {
      type: DataTypes.STRING,
      defaultValue: 'daily',
      allowNull: true,
    },
    backup_retention: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
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