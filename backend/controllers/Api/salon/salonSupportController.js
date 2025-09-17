const { SupportTicket, SupportMessage, User, Subscription, Salon } = require('../../../models');
const notificationService = require('../../../services/notificationService');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class SalonSupportController {
  // Get support tickets for salon owner (only their own tickets)
  async getMyTickets(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        category, 
        priority 
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {
        user_id: req.user.id // Only tickets created by this salon owner
      };

      // Apply filters
      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;

      const tickets = await SupportTicket.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'assignedAdmin',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Subscription,
            as: 'subscription',
            attributes: ['id', 'plan_id', 'status']
          },
          {
            model: SupportMessage,
            as: 'messages',
            limit: 1,
            order: [['created_at', 'DESC']]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: tickets.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: tickets.count,
          totalPages: Math.ceil(tickets.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching salon owner support tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch support tickets',
        error: error.message
      });
    }
  }

  // Get single support ticket by ID (only if created by this salon owner)
  async getTicketById(req, res) {
    try {
      const { id } = req.params;

      const ticket = await SupportTicket.findOne({
        where: {
          id,
          user_id: req.user.id // Ensure ticket belongs to this salon owner
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'avatar']
          },
          {
            model: User,
            as: 'assignedAdmin',
            attributes: ['id', 'name', 'email', 'avatar']
          },
          {
            model: Subscription,
            as: 'subscription'
          },
          {
            model: SupportMessage,
            as: 'messages',
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'name', 'email', 'avatar']
              }
            ],
            order: [['created_at', 'ASC']]
          }
        ]
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Support ticket not found or access denied'
        });
      }

      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      console.error('Error fetching support ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch support ticket',
        error: error.message
      });
    }
  }

  // Create new support ticket for salon owner
  async createTicket(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        category,
        priority = 'medium',
        subject,
        description,
        subscription_id,
        metadata = {}
      } = req.body;

      // Get salon owner's salons for context
      const salons = await Salon.findAll({
        where: { owner_id: req.user.id },
        attributes: ['id', 'name', 'email', 'phone', 'website', 'address_id']
      });

      // Add salon context to metadata
      const enhancedMetadata = {
        ...metadata,
        salons: salons.map(salon => ({
          id: salon.id,
          name: salon.name,
          email: salon.email,
          phone: salon.phone,
          website: salon.website,
          address_id: salon.address_id
        })),
        created_by: 'salon_owner'
      };

      // Generate ticket number
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const ticketNumber = `ST-${timestamp}-${random}`;

      const ticket = await SupportTicket.create({
        user_id: req.user.id,
        category,
        priority,
        subject,
        description,
        subscription_id,
        metadata: enhancedMetadata,
        ticket_number: ticketNumber
      });

      // Create initial message
      await SupportMessage.create({
        ticket_id: ticket.id,
        sender_id: req.user.id,
        message: description
      });

      // Fetch the created ticket with associations
      const createdTicket = await SupportTicket.findByPk(ticket.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Subscription,
            as: 'subscription',
            attributes: ['id', 'plan_id', 'status']
          }
        ]
      });

      // Send notification to admins about new ticket
      try {
        await notificationService.createSupportNotification(createdTicket, null, 'new_ticket');
      } catch (notificationError) {
        console.error('Failed to send notification for new support ticket:', notificationError);
        // Don't fail the request if notification fails
      }

      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        data: createdTicket
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create support ticket',
        error: error.message
      });
    }
  }

  // Add message to support ticket (only if ticket belongs to this salon owner)
  async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.body;

      // Verify ticket belongs to this salon owner
      const ticket = await SupportTicket.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Support ticket not found or access denied'
        });
      }

      const supportMessage = await SupportMessage.create({
        ticket_id: id,
        sender_id: req.user.id,
        message
      });

      const createdMessage = await SupportMessage.findByPk(supportMessage.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'email', 'avatar']
          }
        ]
      });

      // Send notification to admins about new message
      try {
        await notificationService.createSupportNotification(ticket, createdMessage, 'new_message');
      } catch (notificationError) {
        console.error('Failed to send notification for new support message:', notificationError);
        // Don't fail the request if notification fails
      }

      res.status(201).json({
        success: true,
        message: 'Message added successfully',
        data: createdMessage
      });
    } catch (error) {
      console.error('Error adding message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add message',
        error: error.message
      });
    }
  }

  // Get support ticket statistics for salon owner
  async getMyStats(req, res) {
    try {
      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets
      ] = await Promise.all([
        SupportTicket.count({ where: { user_id: req.user.id } }),
        SupportTicket.count({ where: { user_id: req.user.id, status: 'open' } }),
        SupportTicket.count({ where: { user_id: req.user.id, status: 'in_progress' } }),
        SupportTicket.count({ where: { user_id: req.user.id, status: 'resolved' } }),
        SupportTicket.count({ where: { user_id: req.user.id, status: 'closed' } })
      ]);

      // Category breakdown for this salon owner
      const categoryStats = await SupportTicket.findAll({
        where: { user_id: req.user.id },
        attributes: [
          'category',
          [SupportTicket.sequelize.fn('COUNT', SupportTicket.sequelize.col('id')), 'count']
        ],
        group: ['category'],
        raw: true
      });

      // Priority breakdown for this salon owner
      const priorityStats = await SupportTicket.findAll({
        where: { user_id: req.user.id },
        attributes: [
          'priority',
          [SupportTicket.sequelize.fn('COUNT', SupportTicket.sequelize.col('id')), 'count']
        ],
        group: ['priority'],
        raw: true
      });

      res.json({
        success: true,
        data: {
          total: totalTickets,
          by_status: {
            open: openTickets,
            in_progress: inProgressTickets,
            resolved: resolvedTickets,
            closed: closedTickets
          },
          by_category: categoryStats,
          by_priority: priorityStats
        }
      });
    } catch (error) {
      console.error('Error fetching support stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch support statistics',
        error: error.message
      });
    }
  }

  // Get available subscription plans for context when creating tickets
  async getMySubscriptions(req, res) {
    try {
      const subscriptions = await Subscription.findAll({
        where: { 
          user_id: req.user.id,
          status: { [Op.in]: ['active', 'pending', 'trial'] }
        },
        include: [
          {
            model: require('../../../models').SubscriptionPlan,
            as: 'plan',
            attributes: ['id', 'name', 'price', 'billing_cycle']
          }
        ],
        attributes: ['id', 'plan_id', 'status', 'start_date', 'next_billing_date']
      });

      res.json({
        success: true,
        data: subscriptions
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subscriptions',
        error: error.message
      });
    }
  }

  // Get support categories available for salon owners
  async getSupportCategories(req, res) {
    try {
      const categories = [
        {
          value: 'subscription_cancellation',
          label: 'Subscription Cancellation',
          description: 'Request to cancel or modify subscription'
        },
        {
          value: 'refund_request',
          label: 'Refund Request',
          description: 'Request a refund for payments'
        },
        {
          value: 'billing_issue',
          label: 'Billing Issue',
          description: 'Problems with billing or payments'
        },
        {
          value: 'technical_support',
          label: 'Technical Support',
          description: 'Technical issues with the platform'
        },
        {
          value: 'account_issue',
          label: 'Account Issue',
          description: 'Problems with account access or settings'
        },
        {
          value: 'feature_request',
          label: 'Feature Request',
          description: 'Suggest new features or improvements'
        },
        {
          value: 'general_inquiry',
          label: 'General Inquiry',
          description: 'General questions or information requests'
        },
        {
          value: 'bug_report',
          label: 'Bug Report',
          description: 'Report a bug or unexpected behavior'
        }
      ];

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching support categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch support categories',
        error: error.message
      });
    }
  }
}

module.exports = new SalonSupportController();
