'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, let's get some existing notifications and users
    const notifications = await queryInterface.sequelize.query(
      'SELECT id FROM notifications LIMIT 5',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE role IN (\'user\', \'salon\') LIMIT 10',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (notifications.length === 0 || users.length === 0) {
      console.log('No notifications or users found, skipping notification_users seeding');
      return;
    }

    const notificationUsers = [];
    
    // Create some notification-user relationships
    for (let i = 0; i < Math.min(notifications.length, 3); i++) {
      for (let j = 0; j < Math.min(users.length, 5); j++) {
        notificationUsers.push({
          id: uuidv4(),
          notification_id: notifications[i].id,
          user_id: users[j].id,
          is_read: Math.random() > 0.5, // Randomly mark some as read
          read_at: Math.random() > 0.5 ? new Date() : null,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    if (notificationUsers.length > 0) {
      await queryInterface.bulkInsert('notification_users', notificationUsers, {});
      console.log(`Seeded ${notificationUsers.length} notification users successfully.`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('notification_users', null, {});
  }
}; 