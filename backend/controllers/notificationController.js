const {
  Notification,
  NotificationTemplate,
  NotificationUser,
  User,
} = require("../models");
const { Sequelize } = require("sequelize");
const notificationService = require("../services/notificationService");

// Get all notifications
exports.getAllNotifications = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    const where = {};
    if (type && type !== "all") where.type = type;
    if (status && status !== "all") where.status = status;
    if (search) {
      where[Sequelize.Op.or] = [
        { title: { [Sequelize.Op.iLike]: `%${search}%` } },
        { message: { [Sequelize.Op.iLike]: `%${search}%` } },
      ];
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        {
          model: NotificationUser,
          as: "notificationUsers",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    // Transform the data to match frontend expectations
    const transformedNotifications = notifications.map((notification) => {
      const totalRecipients = notification.notificationUsers?.length || 0;
      const sentCount = totalRecipients; // All notifications in the join table are considered "sent"
      const openedCount =
        notification.notificationUsers?.filter((nu) => nu.is_read).length || 0;

      return {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: "medium", // Default since we don't store this
        status: notification.status,
        targetAudience: notification.target_audience,
        channels: ["email"], // Default since we don't store this
        scheduledAt: notification.scheduledAt,
        sentAt: notification.sentAt,
        createdAt: notification.created_at,
        createdBy: notification.created_by,
        recipients: {
          total: totalRecipients,
          sent: sentCount,
          delivered: sentCount, // Assuming all sent are delivered
          opened: openedCount,
          clicked: 0, // We don't track clicks yet
        },
        customFilters: {
          userType: [],
          location: [],
          subscriptionPlan: [],
        },
      };
    });

    res.json(transformedNotifications);
  } catch (error) {
    next(error);
  }
};

// Create a new notification
exports.createNotification = async (req, res, next) => {
  try {
    const notificationData = req.body;
    // Remove id if present at top level
    if ("id" in notificationData) {
      delete notificationData.id;
    }
    // Remove id if present in template
    if (
      notificationData.template &&
      typeof notificationData.template === "object" &&
      "id" in notificationData.template
    ) {
      delete notificationData.template.id;
    }
    // Map camelCase fields to snake_case for DB consistency
    if (notificationData.targetAudience) {
      notificationData.target_audience = notificationData.targetAudience;
      delete notificationData.targetAudience;
    }
    if (notificationData.createdBy) {
      notificationData.created_by = notificationData.createdBy;
      delete notificationData.createdBy;
    }

    // Set created_by if not present
    if (!notificationData.created_by) {
      notificationData.created_by = req.user.name || req.user.email;
    }

    // Set status and dates based on schedule type
    if (notificationData.scheduleType === "now") {
      notificationData.status = "sent";
      notificationData.sentAt = new Date();
    } else if (notificationData.scheduleType === "later") {
      notificationData.status = "scheduled";
      notificationData.scheduledAt = notificationData.scheduledAt;
    } else {
      notificationData.status = "draft";
    }
    delete notificationData.scheduleType;

    // Create the notification first
    const notification = await Notification.create(notificationData);

    // Determine target audience and create notification-user relationships
    let users = [];
    if (notificationData.target_audience === "all") {
      users = await User.findAll({ attributes: ["id"] });
    } else if (notificationData.target_audience === "customers") {
      // Find role_id for 'user'
      const userRole = await require("../models").Role.findOne({
        where: { name: "user" },
      });
      users = await User.findAll({
        where: { role_id: userRole ? userRole.id : null },
        attributes: ["id"],
      });
    } else if (notificationData.target_audience === "salons") {
      const salonRole = await require("../models").Role.findOne({
        where: { name: "salon" },
      });
      users = await User.findAll({
        where: { role_id: salonRole ? salonRole.id : null },
        attributes: ["id"],
      });
    } else if (notificationData.target_audience === "admins") {
      const adminRoles = await require("../models").Role.findAll({
        where: { name: ["admin", "super_admin"] },
      });
      users = await User.findAll({
        where: { role_id: adminRoles.map((r) => r.id) },
        attributes: ["id"],
      });
    } else {
      // For specific user or default case
      const userId = req.user.userId || req.user.id;
      users = [{ id: userId }];
    }

    console.log(
      "Found users for notification:",
      users.map((u) => ({ id: u.id, idLength: u.id.length }))
    );

    // Create notification-user relationships with cleaned user IDs
    const notificationUsers = users.map((user) => {
      const cleanUserId = user.id.toString().trim(); // Remove any whitespace
      console.log("Creating notification-user relationship:", {
        notification_id: notification.id,
        user_id: cleanUserId,
        original_user_id: user.id,
      });

      return {
        notification_id: notification.id,
        user_id: cleanUserId,
        is_read: false,
      };
    });

    console.log("Notification users to create:", notificationUsers);

    await NotificationUser.bulkCreate(notificationUsers);

    // Send push notifications to all users
    const userIds = users.map((u) => u.id);
    await notificationService.sendToUsers(
      userIds,
      notification.title,
      notification.message || "",
      { notificationId: notification.id }
    );

    // Return the created notification with user relationships
    const createdNotification = await Notification.findByPk(notification.id, {
      include: [
        {
          model: NotificationUser,
          as: "notificationUsers",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    // Transform the created notification to match frontend expectations
    const totalRecipients = createdNotification.notificationUsers?.length || 0;
    const sentCount = totalRecipients;
    const openedCount =
      createdNotification.notificationUsers?.filter((nu) => nu.is_read)
        .length || 0;

    const transformedNotification = {
      id: createdNotification.id,
      title: createdNotification.title,
      message: createdNotification.message,
      type: createdNotification.type,
      priority: "medium",
      status: createdNotification.status,
      targetAudience: createdNotification.target_audience,
      channels: ["email"],
      scheduledAt: createdNotification.scheduledAt,
      sentAt: createdNotification.sentAt,
      createdAt: createdNotification.created_at,
      createdBy: createdNotification.created_by,
      recipients: {
        total: totalRecipients,
        sent: sentCount,
        delivered: sentCount,
        opened: openedCount,
        clicked: 0,
      },
      customFilters: {
        userType: [],
        location: [],
        subscriptionPlan: [],
      },
    };

    res.status(201).json(transformedNotification);
  } catch (error) {
    next(error);
  }
};

// Get notification templates
exports.getNotificationTemplates = async (req, res, next) => {
  try {
    const templates = await NotificationTemplate.findAll();
    res.json(templates);
  } catch (error) {
    next(error);
  }
};

// Delete a notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Delete notification-user relationships first
    await NotificationUser.destroy({ where: { notification_id: id } });

    // Then delete the notification
    await Notification.destroy({ where: { id } });

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Send a notification
exports.sendNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.status = "sent";
    notification.sentAt = new Date();
    await notification.save();
    res.json({
      id,
      status: "sent",
      sentAt: notification.sentAt,
      message: "Notification sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET / — List user notifications for dashboard
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { limit = 10, unread_only = false } = req.query;
    
    // Build where clause
    const whereClause = { user_id: userId };
    if (unread_only === 'true') {
      whereClause.is_read = false;
    }
    
    // Find all notification-user relationships for this user
    const notificationUsers = await NotificationUser.findAll({
      where: whereClause,
      include: [
        {
          model: Notification,
          as: 'notification',
          attributes: ['id', 'title', 'message', 'type', 'created_at', 'updated_at']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    // Transform the data to match the expected format
    const notifications = notificationUsers.map(nu => ({
      id: nu.notification.id,
      type: nu.notification.type || 'info',
      title: nu.notification.title,
      message: nu.notification.message,
      priority: 'medium', // Default priority since column doesn't exist
      is_read: nu.is_read,
      created_at: nu.notification.created_at ? new Date(nu.notification.created_at).toISOString() : new Date().toISOString(),
      updated_at: nu.notification.updated_at ? new Date(nu.notification.updated_at).toISOString() : new Date().toISOString(),
      data: null // No data column in current schema
    }));

    res.json({
      success: true,
      data: notifications,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    next(error);
  }
};

// POST /:id/read — Mark a specific notification as read
exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { id } = req.params;
    
    // Update the is_read status in the join table
    const [updated] = await NotificationUser.update(
      { is_read: true },
      { 
        where: { 
          notification_id: id, 
          user_id: userId 
        } 
      }
    );
    
    if (updated === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found or already marked as read' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Notification marked as read' 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    next(error);
  }
};

// POST /mark-all-read — Mark all notifications as read for the user
exports.markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    // Update all unread notifications for this user
    const [updated] = await NotificationUser.update(
      { is_read: true },
      { 
        where: { 
          user_id: userId,
          is_read: false
        } 
      }
    );
    
    res.json({ 
      success: true, 
      message: `${updated} notifications marked as read`,
      updated_count: updated
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    next(error);
  }
};

// GET /unread-count — Get count of unread notifications
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    const unreadCount = await NotificationUser.count({
      where: { 
        user_id: userId,
        is_read: false
      }
    });
    
    res.json({ 
      success: true, 
      unread_count: unreadCount
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    next(error);
  }
};
