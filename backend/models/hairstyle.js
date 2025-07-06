'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hairstyle extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  Hairstyle.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    tags: DataTypes.ARRAY(DataTypes.STRING),
    image_url: DataTypes.STRING,
    ar_model_url: DataTypes.STRING,
    gender: DataTypes.STRING,
    length: DataTypes.STRING,
    color: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Hairstyle',
    timestamps: true,
    underscored: true
  });
  return Hairstyle;
}; 