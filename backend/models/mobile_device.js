'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class MobileDevice extends Model {
    static associate(models) {
      MobileDevice.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  MobileDevice.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    device_token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    device_type: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    last_login: DataTypes.DATE,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'MobileDevice',
    tableName: 'mobile_devices',
    timestamps: true,
    underscored: true
  });
  return MobileDevice;
}; 