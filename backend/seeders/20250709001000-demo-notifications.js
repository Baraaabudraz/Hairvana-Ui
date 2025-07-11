// Seeder for demo notifications
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('notifications', [
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000002', // demo admin
        type: 'info',
        title: 'Welcome to Hairvana!',
        message: 'Your account has been created successfully.',
        is_read: false,
        status: 'sent',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000002',
        type: 'warning',
        title: 'Subscription Expiring Soon',
        message: 'Your subscription will expire in 3 days. Please renew to continue enjoying our services.',
        is_read: false,
        status: 'sent',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        user_id: '00000000-0000-0000-0000-000000000002',
        type: 'promotion',
        title: 'Special Offer!',
        message: 'Get 20% off on your next booking. Use code HAIRVANA20.',
        is_read: false,
        status: 'sent',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('notifications', null, {});
  }
}; 