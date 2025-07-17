'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NotificationUser extends Model {
    static associate(models) {
      NotificationUser.belongsTo(models.Notification, {
        foreignKey: 'notificationId',
        as: 'notification'
      });
      NotificationUser.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  NotificationUser.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    notificationId: {
      field: 'notification_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'notifications',
        key: 'id'
      }
    },
    userId: {
      field: 'user_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    isRead: {
      field: 'is_read',
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    modelName: 'NotificationUser',
    tableName: 'notification_users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['notification_id', 'user_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['notification_id']
      }
    ]
  });
  return NotificationUser;
}; 