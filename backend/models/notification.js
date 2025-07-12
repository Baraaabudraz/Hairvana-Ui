'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Many-to-many relationship with users through NotificationUser
      Notification.belongsToMany(models.User, {
        through: models.NotificationUser,
        foreignKey: 'notification_id',
        otherKey: 'user_id',
        as: 'users'
      });
      
      // Direct access to the join table
      Notification.hasMany(models.NotificationUser, {
        foreignKey: 'notification_id',
        as: 'notificationUsers'
      });
    }
  }
  Notification.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    type: DataTypes.STRING,
    title: DataTypes.STRING,
    message: DataTypes.STRING,
    target_audience: DataTypes.STRING,
    created_by: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'cancelled'),
      defaultValue: 'draft'
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
    underscored: true
  });
  return Notification;
};