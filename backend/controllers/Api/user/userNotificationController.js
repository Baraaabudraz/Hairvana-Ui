const { Notification, NotificationUser, User } = require('../../../models');

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
