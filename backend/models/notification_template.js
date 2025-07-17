'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class NotificationTemplate extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  NotificationTemplate.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    type: DataTypes.STRING,
    category: DataTypes.STRING,
    subject: DataTypes.STRING,
    content: DataTypes.TEXT,
    channels: DataTypes.ARRAY(DataTypes.STRING),
    variables: DataTypes.ARRAY(DataTypes.STRING),
    popular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    sequelize,
    modelName: 'NotificationTemplate',
    tableName: 'notification_templates',
    timestamps: true,
    underscored: true
  });
  return NotificationTemplate;
}; 