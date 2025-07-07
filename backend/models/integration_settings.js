const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class IntegrationSettings extends Model {}
  IntegrationSettings.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    email_provider: {
      type: DataTypes.TEXT,
      defaultValue: 'sendgrid',
    },
    email_api_key: {
      type: DataTypes.TEXT,
    },
    sms_provider: {
      type: DataTypes.TEXT,
      defaultValue: 'twilio',
    },
    sms_api_key: {
      type: DataTypes.TEXT,
    },
    payment_gateway: {
      type: DataTypes.TEXT,
      defaultValue: 'stripe',
    },
    payment_api_key: {
      type: DataTypes.TEXT,
    },
    analytics_provider: {
      type: DataTypes.TEXT,
      defaultValue: 'google',
    },
    analytics_tracking_id: {
      type: DataTypes.TEXT,
    },
    social_logins: {
      type: DataTypes.JSONB,
      defaultValue: { google: true, facebook: false, apple: false },
    },
    webhooks: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
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
    modelName: 'IntegrationSettings',
    tableName: 'integration_settings',
    timestamps: false,
    underscored: true,
  });
  return IntegrationSettings;
}; 