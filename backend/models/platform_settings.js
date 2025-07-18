const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class PlatformSettings extends Model {}
  PlatformSettings.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    site_name: {
      type: DataTypes.TEXT,
      defaultValue: 'Hairvana',
    },
    site_description: {
      type: DataTypes.TEXT,
      defaultValue: 'Professional Salon Management Platform',
    },
    logo: {
      type: DataTypes.TEXT,
    },
    favicon: {
      type: DataTypes.TEXT,
    },
    primary_color: {
      type: DataTypes.TEXT,
      defaultValue: '#8b5cf6',
    },
    secondary_color: {
      type: DataTypes.TEXT,
      defaultValue: '#ec4899',
    },
    timezone: {
      type: DataTypes.TEXT,
      defaultValue: 'UTC',
    },
    currency: {
      type: DataTypes.TEXT,
      defaultValue: 'USD',
    },
    language: {
      type: DataTypes.TEXT,
      defaultValue: 'en',
    },
    maintenance_mode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    registration_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    email_verification_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    max_file_upload_size: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    allowed_file_types: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
    },
    session_timeout: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    password_policy: {
      type: DataTypes.JSONB,
      defaultValue: { min_length: 8, require_uppercase: true, require_lowercase: true, require_numbers: true, require_special_chars: true },
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
    modelName: 'PlatformSettings',
    tableName: 'platform_settings',
    timestamps: false,
    underscored: true,
  });
  return PlatformSettings;
}; 