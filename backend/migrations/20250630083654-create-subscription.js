'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop lingering ENUM types if they exist
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscription_plans_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_subscription_plans_billing_period";');

    // Create subscription_plans table
    await queryInterface.createTable('subscription_plans', {
      id: {
        type: Sequelize.TEXT,
        primaryKey: true
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      yearly_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      billing_period: {
        type: Sequelize.ENUM('monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'monthly'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      description: {
        type: Sequelize.TEXT
      },
      features: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      limits: {
        type: Sequelize.JSONB
      },
      popular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    // Create subscriptions table
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      salon_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'salons',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      plan_id: {
        type: Sequelize.TEXT,
        allowNull: false,
        references: {
          model: 'subscription_plans',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          isIn: [['active', 'trial', 'cancelled', 'past_due']]
        }
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      billing_period: {
        type: Sequelize.ENUM('monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'monthly'
      },
      next_billing_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      billing_cycle: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          isIn: [['monthly', 'yearly']]
        }
      },
      usage: {
        type: Sequelize.JSONB
      },
      payment_method: {
        type: Sequelize.JSONB
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

    // Create billing_history table
    await queryInterface.createTable('billing_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      subscription_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subscriptions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
          isIn: [['paid', 'pending', 'failed', 'refunded']]
        }
      },
      description: {
        type: Sequelize.TEXT
      },
      invoice_number: {
        type: Sequelize.TEXT
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2)
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create triggers for updated_at
    await queryInterface.sequelize.query(`
      CREATE TRIGGER update_subscription_plans_updated_at
        BEFORE UPDATE ON subscription_plans
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();

      CREATE TRIGGER update_subscriptions_updated_at
        BEFORE UPDATE ON subscriptions
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
    `);

    // Insert default subscription plans
    await queryInterface.bulkInsert('subscription_plans', [
      {
        id: 'basic',
        name: 'Basic',
        price: 19.99,
        yearly_price: 199.99,
        description: 'Perfect for small salons getting started',
        features: ['Up to 100 bookings/month', 'Up to 3 staff members', 'Basic customer management', 'Online booking widget', 'Email support', 'Basic reporting'],
        limits: JSON.stringify({ bookings: 100, staff: 3, locations: 1 }),
        popular: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'standard',
        name: 'Standard',
        price: 49.99,
        yearly_price: 499.99,
        description: 'Great for growing salons with more features',
        features: ['Up to 500 bookings/month', 'Up to 10 staff members', 'Advanced customer management', 'Online booking & scheduling', 'Email & chat support', 'Advanced reporting', 'SMS notifications', 'Inventory management'],
        limits: JSON.stringify({ bookings: 500, staff: 10, locations: 1 }),
        popular: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 99.99,
        yearly_price: 999.99,
        description: 'Complete solution for established salons',
        features: ['Unlimited bookings', 'Unlimited staff members', 'Multi-location support', 'Advanced analytics', 'Priority support', 'Custom branding', 'Marketing tools', 'API access', 'Staff management', 'Inventory tracking', 'Financial reporting'],
        limits: JSON.stringify({ bookings: 'unlimited', staff: 'unlimited', locations: 'unlimited' }),
        popular: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },
  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable('billing_history');
    await queryInterface.dropTable('subscriptions');
    await queryInterface.dropTable('subscription_plans');
  }
};