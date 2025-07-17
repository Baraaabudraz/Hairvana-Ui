'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Hairstyle extends Model {
    static associate(models) {
      Hairstyle.belongsTo(models.Salon, { foreignKey: 'salonId', as: 'salon' });
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
    imageUrl: {
      type: DataTypes.STRING,
      field: 'image_url'
    },
    arModelUrl: {
      type: DataTypes.STRING,
      field: 'ar_model_url'
    },
    gender: DataTypes.STRING,
    length: DataTypes.STRING,
    color: DataTypes.STRING,
    salonId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'salon_id',
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