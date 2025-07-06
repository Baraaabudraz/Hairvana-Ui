'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      salon_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'salons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      type: {
        type: Sequelize.ENUM('revenue', 'bookings', 'customers', 'services', 'staff', 'analytics', 'custom'),
        allowNull: false
      },
      period: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'generating', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      data: {
        type: Sequelize.JSON
      },
      generated_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reports');
  }
};