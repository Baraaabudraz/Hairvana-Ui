'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Appointment.init({
    user_id: DataTypes.INTEGER,
    salon_id: DataTypes.INTEGER,
    service_id: DataTypes.INTEGER,
    staff_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    time: DataTypes.STRING,
    status: DataTypes.STRING,
    notes: DataTypes.STRING,
    price: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Appointment',
  });
  return Appointment;
};