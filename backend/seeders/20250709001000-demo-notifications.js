// Seeder for demo notifications
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create demo notifications
    const notifications = [
      {
        id: uuidv4(),
        type: 'info',
        title: 'Welcome to Hairvana!',
        message: 'Your account has been created successfully.',
        status: 'sent',
        target_audience: 'all',
        created_by: 'System',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        type: 'warning',
        title: 'Subscription Expiring Soon',
        message: 'Your subscription will expire in 3 days. Please renew to continue enjoying our services.',
        status: 'sent',
        target_audience: 'all',
        created_by: 'System',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        type: 'promotion',
        title: 'Special Offer!',
        message: 'Get 20% off on your next booking. Use code HAIRVANA20.',
        status: 'sent',
        target_audience: 'all',
        created_by: 'System',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        type: 'announcement',
        title: 'New Features Available',
        message: 'We\'ve added new booking features and improved our mobile app. Check it out!',
        status: 'sent',
        target_audience: 'customers',
        created_by: 'Admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        type: 'success',
        title: 'Payment Successful',
        message: 'Your payment has been processed successfully. Thank you for your business!',
        status: 'sent',
        target_audience: 'customers',
        created_by: 'System',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Insert notifications
    await queryInterface.bulkInsert('notifications', notifications, {});

    // Get all users to create notification-user relationships
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE role IN (\'user\', \'salon\', \'admin\', \'super_admin\')',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create notification-user relationships
    const notificationUsers = [];
    
    notifications.forEach(notification => {
      users.forEach(user => {
        // For 'all' target audience, create relationships with all users
        if (notification.target_audience === 'all') {
          notificationUsers.push({
            id: uuidv4(),
            notification_id: notification.id,
            user_id: user.id,
            is_read: Math.random() > 0.7, // Randomly mark some as read
            created_at: new Date(),
            updated_at: new Date()
          });
        }
        // For 'customers' target audience, create relationships only with users
        else if (notification.target_audience === 'customers') {
          // We'll need to check user role, but for now create for all users
          notificationUsers.push({
            id: uuidv4(),
            notification_id: notification.id,
            user_id: user.id,
            is_read: Math.random() > 0.7,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      });
    });

    // Insert notification-user relationships
    if (notificationUsers.length > 0) {
      await queryInterface.bulkInsert('notification_users', notificationUsers, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Delete notification-user relationships first
    await queryInterface.bulkDelete('notification_users', null, {});
    // Then delete notifications
    await queryInterface.bulkDelete('notifications', null, {});
  }
}; 