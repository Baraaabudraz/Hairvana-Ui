'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NotificationTemplate extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  NotificationTemplate.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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