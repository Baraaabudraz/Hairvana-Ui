// Get all notifications
exports.getAllNotifications = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    
    // In a real app, you'd query your database
    // For this demo, we'll use mock data
    
    // Mock notifications data
    const mockNotifications = [
      {
        id: '1',
        title: 'Welcome to Hairvana Platform',
        message: 'Welcome to the Hairvana platform! We\'re excited to help you grow your salon business.',
        type: 'success',
        priority: 'medium',
        status: 'sent',
        targetAudience: 'salons',
        channels: ['email', 'in-app'],
        sentAt: '2024-06-15T10:30:00Z',
        createdAt: '2024-06-15T09:00:00Z',
        createdBy: 'Sarah Johnson',
        recipients: {
          total: 1247,
          sent: 1247,
          delivered: 1198,
          opened: 856,
          clicked: 234
        }
      },
      {
        id: '2',
        title: 'Subscription Renewal Reminder',
        message: 'Your Premium subscription expires in 3 days. Renew now to continue enjoying all features.',
        type: 'warning',
        priority: 'high',
        status: 'sent',
        targetAudience: 'salons',
        channels: ['email', 'push', 'in-app'],
        sentAt: '2024-06-14T16:45:00Z',
        createdAt: '2024-06-14T16:00:00Z',
        createdBy: 'John Smith',
        recipients: {
          total: 89,
          sent: 89,
          delivered: 87,
          opened: 72,
          clicked: 45
        }
      },
      {
        id: '3',
        title: 'New Features Available',
        message: 'We\'ve added exciting new analytics features to help you track your salon\'s performance better.',
        type: 'announcement',
        priority: 'medium',
        status: 'scheduled',
        targetAudience: 'all',
        channels: ['email', 'push'],
        scheduledAt: '2024-06-16T09:00:00Z',
        createdAt: '2024-06-15T14:20:00Z',
        createdBy: 'Mike Davis',
        recipients: {
          total: 45231,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0
        }
      },
      {
        id: '4',
        title: 'Special Promotion: 30% Off Premium',
        message: 'Limited time offer! Upgrade to Premium and save 30% on your first year.',
        type: 'promotion',
        priority: 'high',
        status: 'draft',
        targetAudience: 'salons',
        channels: ['email', 'push'],
        createdAt: '2024-06-15T11:30:00Z',
        createdBy: 'Lisa Thompson',
        recipients: {
          total: 0,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0
        },
        customFilters: {
          subscriptionPlan: ['Basic', 'Standard']
        }
      },
      {
        id: '5',
        title: 'System Maintenance Notice',
        message: 'Scheduled maintenance on Sunday, June 16th from 2:00 AM to 4:00 AM EST.',
        type: 'warning',
        priority: 'urgent',
        status: 'failed',
        targetAudience: 'all',
        channels: ['email', 'in-app'],
        createdAt: '2024-06-15T08:15:00Z',
        createdBy: 'System Admin',
        recipients: {
          total: 45231,
          sent: 12456,
          delivered: 0,
          opened: 0,
          clicked: 0
        }
      }
    ];
    
    let filteredNotifications = [...mockNotifications];
    
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }
    
    if (status && status !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.status === status);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNotifications = filteredNotifications.filter(n => 
        n.title.toLowerCase().includes(searchLower) || 
        n.message.toLowerCase().includes(searchLower)
      );
    }
    
    res.json(filteredNotifications);
  } catch (error) {
    next(error);
  }
};

// Create a new notification
exports.createNotification = async (req, res, next) => {
  try {
    const notificationData = req.body;
    
    // In a real app, you'd insert into your database
    // For this demo, we'll simulate a successful creation
    
    const newNotification = {
      id: Date.now().toString(),
      ...notificationData,
      createdAt: new Date().toISOString(),
      createdBy: req.user?.name || 'System Admin'
    };
    
    // In a real app, you'd also trigger the actual notification sending
    // through email, push, etc. based on the channels
    
    res.status(201).json(newNotification);
  } catch (error) {
    next(error);
  }
};

// Get notification templates
exports.getNotificationTemplates = async (req, res, next) => {
  try {
    // In a real app, you'd query your database
    // For this demo, we'll return mock data
    
    const notificationTemplates = [
      {
        id: 'welcome-salon',
        name: 'Welcome New Salon',
        description: 'Welcome message for newly registered salons',
        type: 'success',
        category: 'transactional',
        subject: 'Welcome to Hairvana! 🎉',
        content: 'Welcome {{salonName}} to the Hairvana platform! We\'re excited to help you grow your business.',
        channels: ['email', 'in-app'],
        variables: ['salonName', 'ownerName', 'setupLink'],
        popular: true
      },
      {
        id: 'subscription-reminder',
        name: 'Subscription Renewal Reminder',
        description: 'Remind salons about upcoming subscription renewal',
        type: 'warning',
        category: 'transactional',
        subject: 'Your subscription expires in 3 days',
        content: 'Hi {{ownerName}}, your {{planName}} subscription for {{salonName}} expires on {{expiryDate}}.',
        channels: ['email', 'push', 'in-app'],
        variables: ['ownerName', 'salonName', 'planName', 'expiryDate', 'renewLink'],
        popular: true
      },
      {
        id: 'platform-update',
        name: 'Platform Update Announcement',
        description: 'Notify users about new features and updates',
        type: 'announcement',
        category: 'operational',
        subject: 'New Features Available! 🚀',
        content: 'We\'ve added exciting new features to improve your experience. Check out what\'s new!',
        channels: ['email', 'push', 'in-app'],
        variables: ['featureList', 'updateDate', 'learnMoreLink'],
        popular: false
      },
      {
        id: 'promotional-offer',
        name: 'Promotional Offer',
        description: 'Send promotional offers and discounts',
        type: 'promotion',
        category: 'marketing',
        subject: 'Special Offer: {{discountPercent}}% Off!',
        content: 'Limited time offer! Get {{discountPercent}}% off your next subscription upgrade.',
        channels: ['email', 'push'],
        variables: ['discountPercent', 'offerCode', 'expiryDate', 'upgradeLink'],
        popular: true
      },
      {
        id: 'system-maintenance',
        name: 'System Maintenance Notice',
        description: 'Notify about scheduled maintenance',
        type: 'warning',
        category: 'system',
        subject: 'Scheduled Maintenance: {{maintenanceDate}}',
        content: 'We\'ll be performing system maintenance on {{maintenanceDate}} from {{startTime}} to {{endTime}}.',
        channels: ['email', 'in-app'],
        variables: ['maintenanceDate', 'startTime', 'endTime', 'duration'],
        popular: false
      },
      {
        id: 'payment-failed',
        name: 'Payment Failed Alert',
        description: 'Alert when payment processing fails',
        type: 'error',
        category: 'transactional',
        subject: 'Payment Failed - Action Required',
        content: 'We couldn\'t process your payment for {{salonName}}. Please update your payment method.',
        channels: ['email', 'push', 'in-app'],
        variables: ['salonName', 'amount', 'failureReason', 'updateLink'],
        popular: false
      }
    ];
    
    res.json(notificationTemplates);
  } catch (error) {
    next(error);
  }
};

// Delete a notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // In a real app, you'd delete from your database
    // For this demo, we'll simulate a successful deletion
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Send a notification
exports.sendNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // In a real app, you'd update the status and trigger sending
    // For this demo, we'll simulate a successful send
    
    res.json({
      id,
      status: 'sent',
      sentAt: new Date().toISOString(),
      message: 'Notification sent successfully'
    });
  } catch (error) {
    next(error);
  }
};