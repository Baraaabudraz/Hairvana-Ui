'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Report belongs to a User (one-to-many)
      Report.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Report belongs to a Salon (one-to-many)
      Report.belongsTo(models.Salon, {
        foreignKey: 'salon_id',
        as: 'salon'
      });
    }
  }
  Report.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    salon_id: {
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
    generated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('pending', 'generating', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parameters: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'Report',
    timestamps: true,
    underscored: true
  });
  return Report;
};