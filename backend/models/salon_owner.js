'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SalonOwner extends Model {
    static associate(models) {
      SalonOwner.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      SalonOwner.hasMany(models.Salon, {
        foreignKey: 'ownerId',
        as: 'salons'
      });
    }
  }
  SalonOwner.init({
    userId: {
      field: 'user_id',
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    totalSalons: {
      field: 'total_salons',
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalRevenue: {
      field: 'total_revenue',
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    totalBookings: {
      field: 'total_bookings',
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'SalonOwner',
    tableName: 'salon_owners',
    timestamps: true,
    underscored: true
  });
  return SalonOwner;
}; 