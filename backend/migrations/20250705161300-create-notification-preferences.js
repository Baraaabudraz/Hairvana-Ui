'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_preferences', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      email: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      push: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      sms: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      desktop: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      marketing_emails: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      system_notifications: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notification_preferences');
  },
}; 