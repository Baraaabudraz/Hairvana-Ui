'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }
  Customer.init({
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    total_spent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    total_bookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    favorite_services: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Customer',
    timestamps: true,
    underscored: true
  });
  return Customer;
}; 