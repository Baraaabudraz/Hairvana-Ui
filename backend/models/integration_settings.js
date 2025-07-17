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
    emailProvider: {
      field: 'email_provider',
      type: DataTypes.TEXT,
      defaultValue: 'sendgrid',
    },
    emailApiKey: {
      field: 'email_api_key',
      type: DataTypes.TEXT,
    },
    smsProvider: {
      field: 'sms_provider',
      type: DataTypes.TEXT,
      defaultValue: 'twilio',
    },
    smsApiKey: {
      field: 'sms_api_key',
      type: DataTypes.TEXT,
    },
    stripeEnabled: {
      field: 'stripe_enabled',
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    emailEnabled: {
      field: 'email_enabled',
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    smsEnabled: {
      field: 'sms_enabled',
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    paymentGateway: {
      field: 'payment_gateway',
      type: DataTypes.TEXT,
      defaultValue: 'stripe',
    },
    paymentApiKey: {
      field: 'payment_api_key',
      type: DataTypes.TEXT,
    },
    stripeWebhookSecret: {
      field: 'stripe_webhook_secret',
      type: DataTypes.TEXT,
    },
    analyticsProvider: {
      field: 'analytics_provider',
      type: DataTypes.TEXT,
      defaultValue: 'google',
    },
    analyticsTrackingId: {
      field: 'analytics_tracking_id',
      type: DataTypes.TEXT,
    },
    socialLogins: {
      field: 'social_logins',
      type: DataTypes.JSONB,
      defaultValue: { google: true, facebook: false, apple: false },
    },
    webhooks: {
      type: DataTypes.ARRAY(DataTypes.JSONB),
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
    modelName: 'IntegrationSettings',
    tableName: 'integration_settings',
    timestamps: false,
    underscored: true,
  });
  return IntegrationSettings;
}; 