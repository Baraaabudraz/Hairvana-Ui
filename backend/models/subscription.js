'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Subscription.belongsTo(models.Salon, {
        foreignKey: 'salon_id',
        as: 'salon'
      });
      Subscription.belongsTo(models.SubscriptionPlan, {
        foreignKey: 'plan_id',
        as: 'plan'
      });
    }
  }
  Subscription.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    salon_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'salons',
        key: 'id'
      }
    },
    plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'subscription_plans',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'expired'),
      defaultValue: 'active'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    billing_period: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      defaultValue: 'monthly'
    },
    next_billing_date: DataTypes.DATE,
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    billing_cycle: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['monthly', 'yearly']]
      }
    },
    usage: {
      type: DataTypes.JSONB
    },
    payment_method: {
      type: DataTypes.JSONB
    }
  }, {
    sequelize,
    modelName: 'Subscription',
    timestamps: true,
    underscored: true
  });
  return Subscription;
};