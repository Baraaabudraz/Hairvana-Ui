'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Report.init({
    user_id: DataTypes.INTEGER,
    salon_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    period: DataTypes.STRING,
    data: DataTypes.JSON,
    generated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};