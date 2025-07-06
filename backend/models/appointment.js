'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Appointment belongs to a User (many-to-one)
      Appointment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Appointment belongs to a Salon (many-to-one)
      Appointment.belongsTo(models.Salon, {
        foreignKey: 'salon_id',
        as: 'salon'
      });
      
      // Appointment belongs to a Staff member (many-to-one)
      Appointment.belongsTo(models.Staff, {
        foreignKey: 'staff_id',
        as: 'staff'
      });
      
      // Appointment has one Payment (one-to-one)
      Appointment.hasOne(models.Payment, {
        foreignKey: 'appointment_id',
        as: 'payment'
      });
      
      // Appointment belongs to many Services (many-to-many)
      Appointment.belongsToMany(models.Service, {
        through: 'appointment_services',
        foreignKey: 'appointment_id',
        otherKey: 'service_id',
        as: 'services'
      });
    }
  }
  Appointment.init({
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
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
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
    staff_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'staff',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show'),
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: false,
      defaultValue: 60
    },
    special_requests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelled_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
    underscored: true
  });
  return Appointment;
};