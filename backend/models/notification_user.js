'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NotificationUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      NotificationUser.belongsTo(models.Notification, {
        foreignKey: 'notification_id',
        as: 'notification'
      });
      NotificationUser.belongsTo(models.User, {
        foreignKey: 'user_id',
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
    notification_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'notifications',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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