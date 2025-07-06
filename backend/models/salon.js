'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Salon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Salon.belongsTo(models.User, {
        foreignKey: 'owner_id',
        as: 'owner'
      });
      Salon.hasMany(models.Report, {
        foreignKey: 'salon_id',
        as: 'reports'
      });
      Salon.hasMany(models.Staff, {
        foreignKey: 'salon_id',
        as: 'staff'
      });
      Salon.hasMany(models.Appointment, {
        foreignKey: 'salon_id',
        as: 'appointments'
      });
    }
  }
  Salon.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    location: DataTypes.STRING,
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'inactive'),
      defaultValue: 'pending'
    },
    join_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    revenue: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    bookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0
    },
    services: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    hours: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    gallery: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Salon',
    timestamps: true,
    underscored: true
  });
  return Salon;
};