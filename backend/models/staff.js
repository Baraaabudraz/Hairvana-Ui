'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Staff belongs to a Salon (many-to-one)
      Staff.belongsTo(models.Salon, {
        foreignKey: 'salon_id',
        as: 'salon'
      });
      Staff.hasMany(models.Appointment, {
        foreignKey: 'staff_id',
        as: 'appointments'
      });
    }
  }
  Staff.init({
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salonId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'salon_id',
      references: {
        model: 'salons',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    role: {
      type: DataTypes.ENUM('stylist', 'assistant', 'manager', 'receptionist', 'apprentice'),
      allowNull: false,
      defaultValue: 'stylist'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'on_leave', 'terminated'),
      allowNull: false,
      defaultValue: 'active'
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    schedule: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'hire_date'
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      field: 'hourly_rate'
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
      field: 'commission_rate'
    },
    specializations: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
      defaultValue: []
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'experience_years'
    }
  }, {
    sequelize,
    modelName: 'Staff',
    timestamps: true,
    underscored: true
  });
  return Staff;
};