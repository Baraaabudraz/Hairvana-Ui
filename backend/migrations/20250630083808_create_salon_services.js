'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('salon_services', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
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
      service_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'services',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Add unique constraint to prevent duplicate salon-service pairs
    await queryInterface.addConstraint('salon_services', {
      fields: ['salon_id', 'service_id'],
      type: 'unique',
      name: 'salon_service_unique'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('salon_services');
  }
}; 