'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mobile_devices', {
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
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      device_token: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      device_type: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          isIn: [['ios', 'android']]
        }
      },
      last_login: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.addConstraint('mobile_devices', {
      fields: ['user_id', 'device_token'],
      type: 'unique',
      name: 'unique_user_device'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mobile_devices');
  }
};
