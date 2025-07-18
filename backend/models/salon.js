'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

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
      Salon.hasMany(models.Hairstyle, { foreignKey: 'salon_id', as: 'hairstyles' });
      Salon.belongsToMany(models.Service, {
        through: 'salon_services',
        foreignKey: 'salon_id',
        otherKey: 'service_id',
        as: 'services'
      });
    }
  }
  Salon.init({
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
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    location: DataTypes.STRING,
    website: DataTypes.STRING,
    description: DataTypes.TEXT,
    business_license: DataTypes.STRING,
    tax_id: DataTypes.STRING,
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'suspended'),
      defaultValue: 'pending'
    },
    join_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    hours: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    images: {
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