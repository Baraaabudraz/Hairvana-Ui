'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BillingHistory extends Model {
    static associate(models) {
      BillingHistory.belongsTo(models.Subscription, {
        foreignKey: 'subscription_id',
        as: 'subscription'
      });
    }
  }
  BillingHistory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    subscription_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invoice_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'BillingHistory',
    tableName: 'billing_histories',
    underscored: true,
    timestamps: true
  });
  return BillingHistory;
}; 