'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('salons', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      email: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      phone: {
        type: Sequelize.TEXT
      },
      address: {
        type: Sequelize.TEXT
      },
      location: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('active', 'pending', 'suspended'),
        allowNull: false,
        defaultValue: 'pending'
      },
      join_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      revenue: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      bookings: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      rating: {
        type: Sequelize.DECIMAL(3, 1),
        defaultValue: 0
      },
      hours: {
        type: Sequelize.JSONB
      },
      website: {
        type: Sequelize.TEXT
      },
      description: {
        type: Sequelize.TEXT
      },
      business_license: {
        type: Sequelize.TEXT
      },
      tax_id: {
        type: Sequelize.TEXT
      },
      avatar: {
        type: Sequelize.STRING
      },
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('salons');
  }
};