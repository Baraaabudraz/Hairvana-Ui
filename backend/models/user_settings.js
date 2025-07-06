'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserSettings extends Model {
    static associate(models) {
      UserSettings.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  UserSettings.init({
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    department: DataTypes.STRING,
    timezone: DataTypes.STRING,
    language: DataTypes.STRING,
    bio: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'UserSettings',
    tableName: 'user_settings',
    timestamps: true,
    underscored: true
  });
  return UserSettings;
}; 