'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Analytic extends Model {
    static associate(models) {
      // define association here
    }
  }
  Analytic.init({
    userId: {
      field: 'user_id',
      type: DataTypes.INTEGER
    },
    salonId: {
      field: 'salon_id',
      type: DataTypes.INTEGER
    },
    metric: DataTypes.STRING,
    value: DataTypes.FLOAT,
    recordedAt: {
      field: 'recorded_at',
      type: DataTypes.DATE
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
    modelName: 'Analytic',
    tableName: 'analytics',
    timestamps: true,
    underscored: true
  });
  return Analytic;
};