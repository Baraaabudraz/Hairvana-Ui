'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class SubscriptionPayment extends Model {
    static associate(models) {
      // SubscriptionPayment belongs to a User (salon owner)
      SubscriptionPayment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // SubscriptionPayment belongs to a Salon
      SubscriptionPayment.belongsTo(models.Salon, {
        foreignKey: 'salon_id',
        as: 'salon'
      });
      
      // SubscriptionPayment belongs to a SubscriptionPlan
      SubscriptionPayment.belongsTo(models.SubscriptionPlan, {
        foreignKey: 'plan_id',
        as: 'plan'
      });
      
      // Note: Subscription association is handled in the service layer
      // to avoid circular dependencies during model initialization
    }
  }
  
  SubscriptionPayment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    salon_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'salons',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subscription_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    billing_cycle: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      allowNull: false,
      defaultValue: 'monthly'
    },
    method: {
      type: DataTypes.ENUM('stripe', 'paypal', 'bank_transfer'),
      allowNull: false,
      defaultValue: 'stripe'
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded'),
      allowNull: false,
      defaultValue: 'pending'
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    payment_intent_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    client_secret: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    refund_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SubscriptionPayment',
    tableName: 'subscription_payments',
    timestamps: true,
    underscored: true
  });
  
  return SubscriptionPayment;
};
