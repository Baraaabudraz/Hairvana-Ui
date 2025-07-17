'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      Report.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      Report.belongsTo(models.Salon, {
        foreignKey: 'salonId',
        as: 'salon'
      });
    }
  }
  Report.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    salonId: {
      field: 'salon_id',
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'salons',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('revenue', 'bookings', 'customers', 'services', 'staff', 'analytics', 'custom'),
      allowNull: false
    },
    period: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'),
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    generatedAt: {
      field: 'generated_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'generating', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    fileUrl: {
      field: 'file_url',
      type: DataTypes.STRING,
      allowNull: true
    },
    parameters: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
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
    modelName: 'Report',
    tableName: 'reports',
    timestamps: true,
    underscored: true
  });
  return Report;
};