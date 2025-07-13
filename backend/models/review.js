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
      
      // Review belongs to a Staff member (optional - for staff-specific reviews)
      Review.belongsTo(models.Staff, {
        foreignKey: 'staff_id',
        as: 'staff'
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
    staff_id: {
      type: DataTypes.UUID,
      allowNull: true, // Optional - for staff-specific reviews
      references: {
        model: 'staff',
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
    // Individual rating categories
    service_quality: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    cleanliness: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    staff_friendliness: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    value_for_money: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    overall_experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      }
    },
    // Review status
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'hidden'),
      defaultValue: 'pending'
    },
    // Moderation fields
    moderated_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    moderated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    moderation_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Helpful votes
    helpful_votes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Review type
    review_type: {
      type: DataTypes.ENUM('general', 'appointment', 'staff'),
      defaultValue: 'general'
    },
    // Anonymous review option
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['salon_id', 'status']
      },
      {
        fields: ['user_id', 'salon_id']
      },
      {
        fields: ['appointment_id']
      },
      {
        fields: ['staff_id']
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