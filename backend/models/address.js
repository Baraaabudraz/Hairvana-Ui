'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    static associate(models) {
      // One address can belong to multiple salons
      Address.hasOne(models.Salon, {
        foreignKey: 'address_id',
        as: 'salons'
      });
      
      // Can also be used for user addresses, staff addresses, etc.
      // Address.hasMany(models.User, { foreignKey: 'address_id', as: 'users' });
    }

    // Instance method to get full formatted address
    getFullAddress() {
      const parts = [this.street_address];
      parts.push(`${this.city}, ${this.state} ${this.zip_code}`);
      if (this.country && this.country !== 'US') parts.push(this.country);
      return parts.join(', ');
    }

    // Instance method to get short address
    getShortAddress() {
      return `${this.city}, ${this.state}`;
    }
  }

  Address.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    street_address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 200]
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    zip_code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        is: /^\d{5}(-\d{4})?$/
      }
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Address',
    tableName: 'addresses',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeSave: (address) => {
        // Auto-generate formatted address
        address.formatted_address = address.getFullAddress();
      }
    }
  });

  return Address;
}; 