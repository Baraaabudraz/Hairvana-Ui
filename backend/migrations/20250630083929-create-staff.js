'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staffs', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      salon_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'salons',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('stylist', 'assistant', 'manager', 'receptionist', 'apprentice'),
        allowNull: false,
        defaultValue: 'stylist'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'on_leave', 'terminated'),
        allowNull: false,
        defaultValue: 'active'
      },
      avatar: {
        type: Sequelize.STRING
      },
      schedule: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      hire_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      hourly_rate: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      commission_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0
      },
      specializations: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
        defaultValue: []
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      experience_years: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    // Add indexes for better performance
    await queryInterface.addIndex('staffs', ['salon_id']);
    await queryInterface.addIndex('staffs', ['email']);
    await queryInterface.addIndex('staffs', ['role']);
    await queryInterface.addIndex('staffs', ['status']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('staffs');
  }
}; 