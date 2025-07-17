'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Service belongs to many Salons (many-to-many)
      Service.belongsToMany(models.Salon, {
        through: 'salon_services',
        foreignKey: 'service_id',
        otherKey: 'salon_id',
        as: 'salons'
      });
      
      // Service belongs to many Appointments (many-to-many)
      Service.belongsToMany(models.Appointment, {
        through: 'appointment_services',
        foreignKey: 'service_id',
        otherKey: 'appointment_id',
        as: 'appointments'
      });
    }
  }
  Service.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: false,
      defaultValue: 60
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
      allowNull: false,
      defaultValue: 'active'
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url'
    },
    isPopular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_popular'
    },
    specialOffers: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: 'special_offers'
    }
  }, {
    sequelize,
    modelName: 'Service',
    timestamps: true,
    underscored: true
  });
  return Service;
};