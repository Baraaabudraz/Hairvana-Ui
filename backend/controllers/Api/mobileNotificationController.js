const { Notification } = require('../../models');

// GET / — List user notifications
exports.getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// POST /mark-read — Mark notification(s) as read
exports.markNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No notification IDs provided' });
    }
    // Only update notifications that belong to the user
    const [updated] = await Notification.update(
      { is_read: true },
      { where: { id: ids, user_id: userId } }
    );
    res.json({ success: true, updated });
  } catch (error) {
    next(error);
  }
}; 