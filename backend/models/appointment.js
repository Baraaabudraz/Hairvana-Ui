'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

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
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    salonId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'salon_id',
      references: {
        model: 'salons',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    staffId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'staff_id',
      references: {
        model: 'staff',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_at'
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_at'
    },
    status: {
      type: DataTypes.ENUM('pending', 'booked', 'cancelled', 'completed'),
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_price'
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: false,
      defaultValue: 60
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'special_requests'
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'cancellation_reason'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'cancelled_at'
    },
    cancelledBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'cancelled_by',
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