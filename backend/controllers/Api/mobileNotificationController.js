const { Notification, NotificationUser, User } = require('../../models');

// GET / — List user notifications
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    
    // Find all notification-user relationships for this user
    const notificationUsers = await NotificationUser.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Notification,
          as: 'notification'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Transform the data to match the expected format
    const notifications = notificationUsers.map(nu => ({
      id: nu.notification.id,
      type: nu.notification.type,
      title: nu.notification.title,
      message: nu.notification.message,
      target_audience: nu.notification.target_audience,
      created_by: nu.notification.created_by,
      is_read: nu.is_read,
      created_at: nu.notification.created_at,
      updated_at: nu.notification.updated_at
    }));

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// POST /mark-read — Mark notification(s) as read
exports.markNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No notification IDs provided' });
    }
    
    // Update the is_read status in the join table
    const [updated] = await NotificationUser.update(
      { is_read: true },
      { 
        where: { 
          notification_id: ids, 
          user_id: userId 
        } 
      }
    );
    
    res.json({ success: true, updated });
  } catch (error) {
    next(error);
  }
}; 