'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Service belongs to a Salon (many-to-one)
      Service.belongsTo(models.Salon, {
        foreignKey: 'salon_id',
        as: 'salon'
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
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    salon_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'salons',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: false,
      defaultValue: 60
    },
    category: {
      type: DataTypes.ENUM('haircut', 'coloring', 'styling', 'treatment', 'spa', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'discontinued'),
      allowNull: false,
      defaultValue: 'active'
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_popular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    special_offers: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Service',
    timestamps: true,
    underscored: true
  });
  return Service;
};