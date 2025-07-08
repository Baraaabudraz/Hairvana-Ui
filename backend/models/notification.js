'use strict';
const { User } = require('lucide-react');
const {
  Model
} = require('sequelize');
const { FOREIGNKEYS } = require('sequelize/lib/query-types');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
        // Notification belongs to a User (many-to-one)
      Notification.belongsTo(models.User,{
        foreignKey:'user_id',
        as:'user'
      });
    }
  }
  Notification.init({
    user_id: DataTypes.UUID,
    type: DataTypes.STRING,
    title: DataTypes.STRING,
    message: DataTypes.STRING,
    is_read: DataTypes.BOOLEAN,
    created_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
    underscored: true
  });
  return Notification;
};