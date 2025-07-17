'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Payment belongs to a User (many-to-one)
      Payment.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Payment belongs to an Appointment (one-to-one)
      Payment.belongsTo(models.Appointment, {
        foreignKey: 'appointmentId',
        as: 'appointment'
      });
    }
  }
  Payment.init({
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
    appointmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique:true,
      field: 'appointment_id',
      references: {
        model: 'appointments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    method: {
      type: DataTypes.ENUM('visa', 'crypto'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed','cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'transaction_id'
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'payment_date'
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      field: 'refund_amount'
    },
    refundReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'refund_reason'
    }
  }, {
    sequelize,
    modelName: 'Payment',
    timestamps: true,
    underscored: true
  });
  return Payment;
}; 