const { SupportTicket, SupportMessage, User, Subscription } = require('../models');
const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

class SupportController {
  // Get all support tickets with pagination and filters
  async getTickets(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        category, 
        priority, 
        assigned_to,
        search 
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (assigned_to) where.assigned_to = assigned_to;

      // Search functionality
      if (search) {
        where[Op.or] = [
          { ticket_number: { [Op.iLike]: `%${search}%` } },
          { subject: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const tickets = await SupportTicket.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
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
      console.error('Error fetching support tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch support tickets',
        error: error.message
      });
    }
  }

  // Get single support ticket by ID
  async getTicketById(req, res) {
    try {
      const { id } = req.params;

      const ticket = await SupportTicket.findByPk(id, {
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
          message: 'Support ticket not found'
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

  // Create new support ticket
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
        metadata,
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
          }
        ]
      });

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

  // Update support ticket
  async updateTicket(req, res) {
    try {
      const { id } = req.params;
      const {
        status,
        priority,
        assigned_to,
        resolution_notes
      } = req.body;

      const ticket = await SupportTicket.findByPk(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Support ticket not found'
        });
      }

      const updateData = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (assigned_to) updateData.assigned_to = assigned_to;
      if (resolution_notes) updateData.resolution_notes = resolution_notes;

      // Set resolved/closed timestamps
      if (status === 'resolved' && !ticket.resolved_at) {
        updateData.resolved_at = new Date();
      }
      if (status === 'closed' && !ticket.closed_at) {
        updateData.closed_at = new Date();
      }

      await ticket.update(updateData);

      const updatedTicket = await SupportTicket.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'assignedAdmin',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      // Send notification to salon owner about status change
      if (status && status !== ticket.status) {
        try {
          await notificationService.createUserNotification({
            title: 'Support Ticket Status Updated',
            message: `Your support ticket "${ticket.subject}" status has been changed to ${status}`,
            type: 'info',
            priority: 'medium',
            data: {
              ticketId: ticket.id,
              ticketNumber: ticket.ticket_number,
              category: ticket.category,
              action: 'status_change',
              oldStatus: ticket.status,
              newStatus: status,
              updatedBy: req.user.name
            },
            targetUserIds: [ticket.user_id]
          });

          // Also send specialized FCM notification for status change
          const ticketWithOldStatus = { ...updatedTicket.toJSON(), oldStatus: ticket.status };
          await notificationService.sendSupportFCMNotification(
            [ticket.user_id],
            ticketWithOldStatus,
            null,
            'status_change'
          );
        } catch (notificationError) {
          console.error('Failed to send notification for status change:', notificationError);
          // Don't fail the request if notification fails
        }
      }

      res.json({
        success: true,
        message: 'Support ticket updated successfully',
        data: updatedTicket
      });
    } catch (error) {
      console.error('Error updating support ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update support ticket',
        error: error.message
      });
    }
  }

  // Add message to support ticket
  async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { message, is_internal = false } = req.body;

      const ticket = await SupportTicket.findByPk(id);
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Support ticket not found'
        });
      }

      const supportMessage = await SupportMessage.create({
        ticket_id: id,
        sender_id: req.user.id,
        message,
        is_internal
      });

      // Update ticket status if it was resolved/closed
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        await ticket.update({ status: 'in_progress' });
      }

      const createdMessage = await SupportMessage.findByPk(supportMessage.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'email', 'avatar']
          }
        ]
      });

      // Send notification to salon owner if admin replied (not internal note)
      if (!is_internal && (req.user.role === 'admin' || req.user.role === 'super admin')) {
        try {
          // Create a notification for the salon owner about admin reply
          await notificationService.createUserNotification({
            title: 'Admin Reply to Support Ticket',
            message: `Admin ${req.user.name} replied to your support ticket "${ticket.subject}"`,
            type: 'info',
            priority: 'medium',
            data: {
              ticketId: ticket.id,
              ticketNumber: ticket.ticket_number,
              category: ticket.category,
              action: 'admin_reply',
              messageId: createdMessage.id,
              adminName: req.user.name
            },
            targetUserIds: [ticket.user_id] // Target specific user
          });

          // Also send specialized FCM notification for admin reply
          await notificationService.sendSupportFCMNotification(
            [ticket.user_id],
            ticket,
            createdMessage,
            'admin_reply'
          );
        } catch (notificationError) {
          console.error('Failed to send notification for admin reply:', notificationError);
          // Don't fail the request if notification fails
        }
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

  // Get support statistics
  async getStats(req, res) {
    try {
      const [
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets
      ] = await Promise.all([
        SupportTicket.count(),
        SupportTicket.count({ where: { status: 'open' } }),
        SupportTicket.count({ where: { status: 'in_progress' } }),
        SupportTicket.count({ where: { status: 'resolved' } }),
        SupportTicket.count({ where: { status: 'closed' } })
      ]);

      // Category breakdown
      const categoryStats = await SupportTicket.findAll({
        attributes: [
          'category',
          [SupportTicket.sequelize.fn('COUNT', SupportTicket.sequelize.col('id')), 'count']
        ],
        group: ['category'],
        raw: true
      });

      // Priority breakdown
      const priorityStats = await SupportTicket.findAll({
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

  // Process subscription cancellation
  async processCancellation(req, res) {
    try {
      const { ticketId } = req.params;
      const { reason, immediate = false } = req.body;

      const ticket = await SupportTicket.findByPk(ticketId, {
        include: [
          {
            model: Subscription,
            as: 'subscription'
          }
        ]
      });

      if (!ticket || ticket.category !== 'subscription_cancellation') {
        return res.status(400).json({
          success: false,
          message: 'Invalid cancellation request'
        });
      }

      if (!ticket.subscription) {
        return res.status(400).json({
          success: false,
          message: 'No subscription found for this ticket'
        });
      }

      // Process cancellation
      const cancellationDate = immediate ? new Date() : ticket.subscription.next_billing_date;
      
      await ticket.subscription.update({
        status: immediate ? 'cancelled' : 'pending_cancellation',
        cancelled_at: immediate ? new Date() : null,
        cancellation_date: cancellationDate,
        cancellation_reason: reason
      });

      // Update ticket
      await ticket.update({
        status: 'resolved',
        resolved_at: new Date(),
        resolution_notes: `Subscription ${immediate ? 'cancelled immediately' : 'scheduled for cancellation'} on ${cancellationDate.toDateString()}`
      });

      // Add internal message
      await SupportMessage.create({
        ticket_id: ticketId,
        sender_id: req.user.id,
        message: `Subscription cancellation processed. ${immediate ? 'Cancelled immediately' : `Scheduled for ${cancellationDate.toDateString()}`}`,
        is_internal: true
      });

      res.json({
        success: true,
        message: 'Subscription cancellation processed successfully'
      });
    } catch (error) {
      console.error('Error processing cancellation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process cancellation',
        error: error.message
      });
    }
  }

  // Process refund request
  async processRefund(req, res) {
    try {
      const { ticketId } = req.params;
      const { amount, reason, refund_method = 'original' } = req.body;

      const ticket = await SupportTicket.findByPk(ticketId, {
        include: [
          {
            model: Subscription,
            as: 'subscription'
          }
        ]
      });

      if (!ticket || ticket.category !== 'refund_request') {
        return res.status(400).json({
          success: false,
          message: 'Invalid refund request'
        });
      }

      // Here you would integrate with your payment processor
      // For now, we'll just update the ticket status
      
      await ticket.update({
        status: 'resolved',
        resolved_at: new Date(),
        resolution_notes: `Refund of $${amount} processed via ${refund_method}. Reason: ${reason}`
      });

      // Add internal message
      await SupportMessage.create({
        ticket_id: ticketId,
        sender_id: req.user.id,
        message: `Refund processed: $${amount} via ${refund_method}`,
        is_internal: true
      });

      res.json({
        success: true,
        message: 'Refund processed successfully'
      });
    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process refund',
        error: error.message
      });
    }
  }
}

module.exports = new SupportController();
