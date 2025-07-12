'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
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
      data: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      generated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.ENUM('pending', 'generating', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      file_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      parameters: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('reports');
  }
};