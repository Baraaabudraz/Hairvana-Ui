'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class MobileDevice extends Model {
    static associate(models) {
      MobileDevice.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  MobileDevice.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false
    },
    userId: {
      field: 'user_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    deviceToken: {
      field: 'device_token',
      type: DataTypes.TEXT,
      allowNull: false
    },
    deviceType: {
      field: 'device_type',
      type: DataTypes.TEXT,
      allowNull: false
    },
    lastLogin: {
      field: 'last_login',
      type: DataTypes.DATE
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'MobileDevice',
    tableName: 'mobile_devices',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'device_token']
      }
    ]
  });
  return MobileDevice;
}; 