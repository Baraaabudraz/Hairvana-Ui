"use strict";
const { Model } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
         static associate(models) {
       Subscription.belongsTo(models.User, {
         foreignKey: "owner_id",
         as: "owner",
       });
       Subscription.belongsTo(models.SubscriptionPlan, {
         foreignKey: "plan_id",
         as: "plan",
       });
     }
  }
  Subscription.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
        allowNull: false,
      },
                    ownerId: {
         type: DataTypes.UUID,
         allowNull: false,
         references: {
           model: "users",
           key: "id",
         },
         field: "owner_id",
       },
      planId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "subscription_plans",
          key: "id",
        },
        field: "plan_id",
      },
      status: {
        type: DataTypes.ENUM("active", "cancelled", "expired"),
        defaultValue: "active",
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "start_date",
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "end_date",
      },
      billingPeriod: {
        type: DataTypes.ENUM("monthly", "yearly"),
        defaultValue: "monthly",
        field: "billing_period",
      },
      nextBillingDate: {
        type: DataTypes.DATE,
        field: "next_billing_date",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      billingCycle: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["monthly", "yearly"]],
        },
        field: "billing_cycle",
      },
      usage: {
        type: DataTypes.JSONB,
      },
      paymentMethod: {
        type: DataTypes.JSONB,
        field: "payment_method",
      },
      paymentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "subscription_payments",
          key: "id",
        },
        field: "payment_id",
      },
    },
    {
      sequelize,
      modelName: "Subscription",
      timestamps: true,
      underscored: true,
    }
  );
  return Subscription;
};
