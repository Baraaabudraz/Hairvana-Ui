'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Hairstyle extends Model {
    static associate(models) {
      Hairstyle.belongsTo(models.Salon, { foreignKey: 'salon_id', as: 'salon' });
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
    color: DataTypes.STRING,
    segmented_image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    salon_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'salons',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Hairstyle',
    timestamps: true,
    underscored: true
  });
  return Hairstyle;
}; 