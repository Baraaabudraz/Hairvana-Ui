'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Hairstyle extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  Hairstyle.init({
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