'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class SubscriptionPlan extends Model {
    static associate(models) {
      SubscriptionPlan.hasMany(models.Subscription, {
        foreignKey: 'plan_id',
        as: 'subscriptions'
      });
    }
  }
  SubscriptionPlan.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    yearlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'yearly_price'
    },
    billingPeriod: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      defaultValue: 'monthly',
      field: 'billing_period'
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    limits: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'SubscriptionPlan',
    tableName: 'subscription_plans',
    timestamps: true,
    underscored: true
  });
  return SubscriptionPlan;
}; 