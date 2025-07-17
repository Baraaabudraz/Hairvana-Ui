const { Model, DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize) => {
  class NotificationPreferences extends Model {}
  NotificationPreferences.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      field: 'user_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    email: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    push: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    desktop: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    marketingEmails: {
      field: 'marketing_emails',
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    systemNotifications: {
      field: 'system_notifications',
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'NotificationPreferences',
    tableName: 'notification_preferences',
    timestamps: false,
    underscored: true,
  });
  return NotificationPreferences;
}; 