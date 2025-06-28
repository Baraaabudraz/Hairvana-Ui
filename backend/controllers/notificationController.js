// Get all notifications
exports.getAllNotifications = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    
    let query = req.supabase
      .from('notifications')
      .select('*');
    
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

// Create a new notification
exports.createNotification = async (req, res, next) => {
  try {
    const notificationData = req.body;
    
    // Add creator info
    notificationData.createdBy = req.user.name || req.user.email;
    notificationData.createdAt = new Date().toISOString();
    
    // If sending now, set sentAt
    if (notificationData.scheduleType === 'now') {
      notificationData.status = 'sent';
      notificationData.sentAt = new Date().toISOString();
    } else if (notificationData.scheduleType === 'later') {
      notificationData.status = 'scheduled';
      notificationData.scheduledAt = notificationData.scheduledAt;
    } else {
      notificationData.status = 'draft';
    }
    
    // Remove scheduleType as it's not stored in the database
    delete notificationData.scheduleType;
    
    const { data, error } = await req.supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single();
    
    if (error) throw error;
    
    // In a real app, you'd also trigger the actual notification sending
    // through email, push, etc. based on the channels
    
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

// Get notification templates
exports.getNotificationTemplates = async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('notification_templates')
      .select('*');
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    next(error);
  }
};

// Delete a notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { error } = await req.supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Send a notification
exports.sendNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get the notification
    const { data: notification, error: fetchError } = await req.supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Update the notification status
    const { data, error } = await req.supabase
      .from('notifications')
      .update({
        status: 'sent',
        sentAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // In a real app, you'd trigger the actual notification sending here
    
    res.json({
      id,
      status: 'sent',
      sentAt: data.sentAt,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    next(error);
  }
};