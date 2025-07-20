'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class OwnerDocument extends Model {
    static associate(models) {
      OwnerDocument.belongsTo(models.User, {
        foreignKey: 'owner_id',
        as: 'owner'
      });
    }
  }
  OwnerDocument.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    commercial_registration_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    certificate_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    additional_info: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'OwnerDocument',
    tableName: 'owner_documents',
    timestamps: true,
    underscored: true
  });
  return OwnerDocument;
}; 