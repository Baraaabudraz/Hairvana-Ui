'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  Customer.init({
    userId: {
      type: DataTypes.UUID,
      primaryKey: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    totalSpent: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'total_spent'
    },
    totalBookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_bookings'
    },
    favoriteServices: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      field: 'favorite_services'
    }
  }, {
    sequelize,
    modelName: 'Customer',
    timestamps: true,
    underscored: true
  });
  return Customer;
}; 