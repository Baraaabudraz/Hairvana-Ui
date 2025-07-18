'use strict';
const { Model } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      // Review belongs to a User (customer who wrote the review)
      Review.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Review belongs to a Salon (the salon being reviewed)
      Review.belongsTo(models.Salon, {
        foreignKey: 'salon_id',
        as: 'salon'
      });
      
      // Review belongs to an Appointment (optional - for appointment-specific reviews)
      Review.belongsTo(models.Appointment, {
        foreignKey: 'appointment_id',
        as: 'appointment'
      });
    }
  }
  
  Review.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    salon_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'salons',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: true, // Optional - for general salon reviews
      references: {
        model: 'appointments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    service_quality: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['salon_id']
      },
      {
        fields: ['user_id', 'salon_id']
      },
      {
        fields: ['appointment_id']
      },
      {
        fields: ['rating']
      },
      {
        fields: ['created_at']
      }
    ]
  });
  
  return Review;
}; 