'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BillingSettings extends Model {
    static associate(models) {
      BillingSettings.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  BillingSettings.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    default_payment_method: DataTypes.STRING,
    billing_address: DataTypes.TEXT,
    tax_id: DataTypes.STRING,
    invoice_email: DataTypes.STRING,
    auto_pay: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    payment_methods: DataTypes.JSONB,
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
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