'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SalonOwner extends Model {
    static associate(models) {
      SalonOwner.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      SalonOwner.hasMany(models.Salon, {
        foreignKey: 'owner_id',
        as: 'salons'
      });
    }
  }
  SalonOwner.init({
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    total_salons: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    total_revenue: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    total_bookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'SalonOwner',
    timestamps: true,
    underscored: true
  });
  return SalonOwner;
}; 