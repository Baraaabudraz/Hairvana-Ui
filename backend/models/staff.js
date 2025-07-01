'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Staff.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    salon_id: DataTypes.INTEGER,
    role: DataTypes.STRING,
    status: DataTypes.STRING,
    avatar: DataTypes.STRING,
    services: DataTypes.JSON,
    schedule: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Staff',
  });
  return Staff;
};