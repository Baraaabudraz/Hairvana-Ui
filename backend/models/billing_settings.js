'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class BillingSettings extends Model {
    static associate(models) {
      BillingSettings.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  BillingSettings.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    defaultPaymentMethod: {
      field: 'default_payment_method',
      type: DataTypes.STRING,
    },
    billingAddress: {
      field: 'billing_address',
      type: DataTypes.TEXT,
    },
    taxId: {
      field: 'tax_id',
      type: DataTypes.STRING,
    },
    invoiceEmail: {
      field: 'invoice_email',
      type: DataTypes.STRING,
    },
    autoPay: {
      field: 'auto_pay',
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paymentMethods: {
      field: 'payment_methods',
      type: DataTypes.JSONB,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'BillingSettings',
    tableName: 'billing_settings',
    timestamps: false,
    underscored: true
  });
  return BillingSettings;
}; 