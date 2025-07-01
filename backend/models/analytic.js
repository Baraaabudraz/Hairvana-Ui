'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Analytic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Analytic.init({
    user_id: DataTypes.INTEGER,
    salon_id: DataTypes.INTEGER,
    metric: DataTypes.STRING,
    value: DataTypes.FLOAT,
    recorded_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Analytic',
  });
  return Analytic;
};