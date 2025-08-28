'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create subscription_payments table
    await queryInterface.createTable('subscription_payments', {
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
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      plan_id: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: {
          model: 'subscription_plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      billing_cycle: {
        type: Sequelize.ENUM('monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'monthly'
      },
      method: {
        type: Sequelize.ENUM('stripe', 'paypal', 'bank_transfer'),
        allowNull: false,
        defaultValue: 'stripe'
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      payment_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      payment_intent_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      client_secret: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      refund_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
      },
      refund_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Add payment_id column to subscriptions table (only if it doesn't exist)
    const tableDescription = await queryInterface.describeTable('subscriptions');
    if (!tableDescription.payment_id) {
      await queryInterface.addColumn('subscriptions', 'payment_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'subscription_payments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove payment_id column from subscriptions table
    await queryInterface.removeColumn('subscriptions', 'payment_id');
    
    // Drop subscription_payments table
    await queryInterface.dropTable('subscription_payments');
  }
};
