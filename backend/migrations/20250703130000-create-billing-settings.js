'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('billing_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      default_payment_method: {
        type: Sequelize.STRING,
        allowNull: true
      },
      billing_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tax_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      invoice_email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      auto_pay: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      payment_methods: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('billing_settings');
  }
}; 