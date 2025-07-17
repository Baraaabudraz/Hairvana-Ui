'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.SalonOwner, {
        foreignKey: 'user_id',
        as: 'salonOwner'
      });
      User.hasOne(models.Customer, {
        foreignKey: 'user_id',
        as: 'customer'
      });
      User.hasMany(models.Salon, {
        foreignKey: 'owner_id',
        as: 'salons'
      });
      // User.hasMany(models.Subscription, {
      //   foreignKey: 'user_id',
      //   as: 'subscriptions'
      // });
      User.hasOne(models.UserSettings, {
        foreignKey: 'user_id',
        as: 'userSettings'
      });
      User.hasMany(models.Report, {
        foreignKey: 'user_id',
        as: 'reports'
      });
      User.hasMany(models.Appointment, {
        foreignKey: 'user_id',
        as: 'appointments'
      });
      
      // Many-to-many relationship with notifications through NotificationUser
      User.belongsToMany(models.Notification, {
        through: models.NotificationUser,
        foreignKey: 'user_id',
        otherKey: 'notification_id',
        as: 'notifications'
      });
      
      // Direct access to the join table
      User.hasMany(models.NotificationUser, {
        foreignKey: 'user_id',
        as: 'notificationUsers'
      });
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash'
    },
    phone: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'salon', 'user'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'inactive'),
      defaultValue: 'pending'
    },
    avatar: DataTypes.STRING,
    permissions: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    joinDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'join_date'
    },
    lastLogin: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'last_login'
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    underscored: true
  });
  return User;
};