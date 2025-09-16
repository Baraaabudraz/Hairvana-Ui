'use strict';
const {
  Model
} = require('sequelize');
const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class SupportTicket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User who created the ticket
      SupportTicket.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      // Admin who is assigned to the ticket
      SupportTicket.belongsTo(models.User, {
        foreignKey: 'assigned_to',
        as: 'assignedAdmin'
      });

      // Related subscription (if applicable)
      SupportTicket.belongsTo(models.Subscription, {
        foreignKey: 'subscription_id',
        as: 'subscription'
      });

      // Support messages/replies
      SupportTicket.hasMany(models.SupportMessage, {
        foreignKey: 'ticket_id',
        as: 'messages'
      });
    }
  }
  
  SupportTicket.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      allowNull: false
    },
    ticket_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    subscription_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'subscriptions',
        key: 'id'
      }
    },
    category: {
      type: DataTypes.ENUM(
        'subscription_cancellation',
        'refund_request',
        'billing_issue',
        'technical_support',
        'account_issue',
        'feature_request',
        'general_inquiry',
        'bug_report'
      ),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'pending_user', 'resolved', 'closed'),
      defaultValue: 'open'
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    resolution_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'SupportTicket',
    tableName: 'support_tickets',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (ticket) => {
        // Generate ticket number
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        ticket.ticket_number = `ST-${timestamp}-${random}`;
      }
    }
  });
  
  return SupportTicket;
};
