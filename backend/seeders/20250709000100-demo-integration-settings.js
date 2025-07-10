'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('integration_settings', [
      {
        id: uuidv4(),
        email_provider: 'sendgrid',
        email_api_key: '',
        sms_provider: 'twilio',
        sms_api_key: '',
        payment_gateway: 'stripe',
        payment_api_key: '',
        analytics_provider: 'google',
        analytics_tracking_id: '',
        social_logins: JSON.stringify({ google: true, facebook: false, apple: false }),
        webhooks: Sequelize.literal('ARRAY[]::jsonb[]'),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('integration_settings', null, {});
  }
}; 