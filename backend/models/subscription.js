'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Subscription.belongsTo(models.Salon, {
        foreignKey: 'salonId',
        as: 'salon'
      });
      Subscription.belongsTo(models.SubscriptionPlan, {
        foreignKey: 'planId',
        as: 'plan'
      });
    }
  }
  Subscription.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    salonId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'salon_id',
      references: {
        model: 'salons',
        key: 'id'
      }
    },
    planId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'plan_id',
      references: {
        model: 'subscription_plans',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'expired'),
      defaultValue: 'active'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_date'
    },
    billingPeriod: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      defaultValue: 'monthly',
      field: 'billing_period'
    },
    nextBillingDate: {
      type: DataTypes.DATE,
      field: 'next_billing_date'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    billingCycle: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['monthly', 'yearly']]
      },
      field: 'billing_cycle'
    },
    usage: {
      type: DataTypes.JSONB
    },
    paymentMethod: {
      type: DataTypes.JSONB,
      field: 'payment_method'
    }
  }, {
    sequelize,
    modelName: 'Subscription',
    timestamps: true,
    underscored: true
  });
  return Subscription;
};