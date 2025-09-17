const admin = require('../lib/firebase');
const { MobileDevice, Notification, User, NotificationUser } = require('../models');

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

exports.sendToUsers = async (userIds, title, body, data) => {
  const devices = await MobileDevice.findAll({ where: { user_id: userIds } });
  if (!devices.length) {
    console.log('No mobile devices found for FCM notification');
    return { success: 0, failure: 0, total: 0 };
  }

  const tokens = devices.map(d => d.device_token);
  const userIdsOrdered = devices.map(d => d.user_id);

  const tokenBatches = chunkArray(tokens, 500);
  const userIdBatches = chunkArray(userIdsOrdered, 500);

  let totalSuccess = 0;
  let totalFailure = 0;

  for (let i = 0; i < tokenBatches.length; i++) {
    const batchTokens = tokenBatches[i];
    const batchUserIds = userIdBatches[i];
    console.log('Sending to tokens:', batchTokens);
    try {
      // --- TEST: Send minimal payload (only notification, no data) ---
      const response = await admin.messaging().sendEachForMulticast({
        notification: { title, body },
        data,
        tokens: batchTokens,
      });
      // --- To restore full payload, use this instead: ---
      // const response = await admin.messaging().sendEachForMulticast({
      //   notification: { title, body },
      //   data,
      //   tokens: batchTokens,
      // });
      console.log('FCM response:', JSON.stringify(response, null, 2));

      await Promise.all(response.responses.map((res, idx) =>
        Notification.create({
          user_id: batchUserIds[idx],
          title,
          body,
          data,
          status: res.success ? 'sent' : 'failed',
          sent_at: res.success ? new Date() : null,
        })
      ));

      totalSuccess += response.successCount;
      totalFailure += response.failureCount;
    } catch (err) {
      console.error('Error sending push notification batch:', err);
    }
  }

  return {
    success: totalSuccess,
    failure: totalFailure,
    total: tokens.length,
  };
};

/**
 * Create a dashboard notification for admins
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type (info, warning, success, error)
 * @param {string} options.priority - Priority level (low, medium, high, urgent)
 * @param {Object} options.data - Additional data to include
 * @param {Array} options.targetRoles - Array of roles to target (default: ['admin', 'super admin'])
 * @returns {Promise<Object>} - Result object with success/failure counts
 */
exports.createDashboardNotification = async (options) => {
  try {
    const {
      title,
      message,
      type = 'info',
      priority = 'medium',
      data = {},
      targetRoles = ['admin', 'super admin']
    } = options;

    // Find all admin users
    const adminUsers = await User.findAll({
      include: [
        {
          model: require('../models').Role,
          as: 'role',
          where: {
            name: targetRoles
          },
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'name', 'email']
    });

    if (adminUsers.length === 0) {
      console.log('No admin users found for notification');
      return { success: 0, failure: 0, total: 0 };
    }

    // Create the notification record
    const notification = await Notification.create({
      type,
      title,
      message,
      target_audience: 'admins',
      created_by: 'system',
      status: 'sent'
    });

    // Create notification-user relationships for all admins
    const notificationUsers = adminUsers.map(admin => ({
      notification_id: notification.id,
      user_id: admin.id,
      read: false,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await NotificationUser.bulkCreate(notificationUsers);

    // Note: Dashboard notifications are for web dashboard users (admins)
    // They don't need FCM push notifications since they use the web interface
    // FCM notifications are only sent to mobile app users (salon owners)
    console.log('Dashboard notification created for web dashboard users (no FCM needed)');

    console.log(`Dashboard notification created: "${title}" for ${adminUsers.length} admins`);

    return {
      success: adminUsers.length,
      failure: 0,
      total: adminUsers.length,
      notificationId: notification.id
    };

  } catch (error) {
    console.error('Error creating dashboard notification:', error);
    return {
      success: 0,
      failure: 1,
      total: 0,
      error: error.message
    };
  }
};

/**
 * Create a notification for specific users
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type (info, warning, success, error)
 * @param {string} options.priority - Priority level (low, medium, high, urgent)
 * @param {Object} options.data - Additional data to include
 * @param {Array} options.targetUserIds - Array of user IDs to target
 * @returns {Promise<Object>} - Result object with success/failure counts
 */
exports.createUserNotification = async (options) => {
  try {
    const {
      title,
      message,
      type = 'info',
      priority = 'medium',
      data = {},
      targetUserIds = []
    } = options;

    if (!targetUserIds || targetUserIds.length === 0) {
      console.log('No target user IDs provided for notification');
      return { success: 0, failure: 0, total: 0 };
    }

    // Find target users
    const targetUsers = await User.findAll({
      where: {
        id: targetUserIds
      },
      attributes: ['id', 'name', 'email']
    });

    if (targetUsers.length === 0) {
      console.log('No target users found for notification');
      return { success: 0, failure: 0, total: 0 };
    }

    // Create the notification record
    const notification = await Notification.create({
      type,
      title,
      message,
      target_audience: 'custom',
      created_by: 'system',
      status: 'sent'
    });

    // Create notification-user relationships for target users
    const notificationUsers = targetUsers.map(user => ({
      notification_id: notification.id,
      user_id: user.id,
      read: false,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await NotificationUser.bulkCreate(notificationUsers);

    // Send FCM push notifications to target users
    try {
      // Convert data to string format for FCM
      const stringData = {};
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          stringData[key] = String(data[key]);
        }
      });
      
      const fcmResult = await exports.sendToUsers(
        targetUserIds,
        title,
        message,
        stringData
      );
      
      console.log(`FCM notifications sent: ${fcmResult.success} success, ${fcmResult.failure} failure`);
    } catch (fcmError) {
      console.error('Failed to send FCM notifications for user notification:', fcmError);
      // Don't fail the main operation if FCM fails
    }

    console.log(`User notification created: "${title}" for ${targetUsers.length} users`);

    return {
      success: targetUsers.length,
      failure: 0,
      total: targetUsers.length,
      notificationId: notification.id
    };

  } catch (error) {
    console.error('Error creating user notification:', error);
    return {
      success: 0,
      failure: 1,
      total: 0,
      error: error.message
    };
  }
};

/**
 * Create a support ticket notification for admins with FCM push notifications
 * @param {Object} ticket - Support ticket object
 * @param {Object} message - Support message object
 * @param {string} action - Action type (new_message, new_ticket, status_change)
 * @returns {Promise<Object>} - Result object
 */
exports.createSupportNotification = async (ticket, message, action = 'new_message') => {
  try {
    let title, notificationMessage, type, priority;

    switch (action) {
      case 'new_ticket':
        title = 'New Support Ticket Created';
        notificationMessage = `New support ticket "${ticket.subject}" from ${ticket.user?.name || 'Unknown User'}`;
        type = 'info';
        priority = 'medium';
        break;
      
      case 'new_message':
        title = 'New Support Message';
        notificationMessage = `New message in ticket "${ticket.subject}" from ${message.sender?.name || 'Unknown User'}`;
        type = 'info';
        priority = 'medium';
        break;
      
      case 'status_change':
        title = 'Support Ticket Status Updated';
        notificationMessage = `Ticket "${ticket.subject}" status changed to ${ticket.status}`;
        type = 'info';
        priority = 'low';
        break;
      
      default:
        title = 'Support Ticket Update';
        notificationMessage = `Update on ticket "${ticket.subject}"`;
        type = 'info';
        priority = 'low';
    }

    const data = {
      ticketId: ticket.id,
      ticketNumber: ticket.ticket_number,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      action,
      messageId: message?.id,
      senderId: message?.sender_id || ticket.user_id,
      senderName: message?.sender?.name || ticket.user?.name,
      type: 'support_notification'
    };

    // Create dashboard notification
    const dashboardResult = await exports.createDashboardNotification({
      title,
      message: notificationMessage,
      type,
      priority,
      data
    });

    // Send FCM push notifications to salon owners (who use mobile devices)
    // Admins use web dashboard, so they don't need FCM notifications
    try {
      let targetUserIds = [];
      
      if (action === 'admin_reply' || action === 'status_change') {
        // Send FCM to salon owner when admin replies or changes status
        // Salon owners use mobile devices and need push notifications
        targetUserIds = [ticket.user_id];
      }
      // Note: For new_ticket and new_message from salon owners, we don't send FCM to anyone
      // because:
      // - Admins use web dashboard (they'll see dashboard notifications)
      // - Salon owners don't need to be notified of their own messages
      // - Dashboard notifications are already created above for admins

      if (targetUserIds.length > 0) {
        // Convert data to string format for FCM
        const stringData = {};
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
            stringData[key] = String(data[key]);
          }
        });
        
        const fcmResult = await exports.sendToUsers(
          targetUserIds,
          title,
          notificationMessage,
          stringData
        );
        
        console.log(`FCM notifications sent: ${fcmResult.success} success, ${fcmResult.failure} failure`);
      } else {
        console.log('No FCM notifications needed for this action type');
      }
    } catch (fcmError) {
      console.error('Failed to send FCM notifications for support ticket:', fcmError);
      // Don't fail the main operation if FCM fails
    }

    return dashboardResult;

  } catch (error) {
    console.error('Error creating support notification:', error);
    return {
      success: 0,
      failure: 1,
      total: 0,
      error: error.message
    };
  }
};

/**
 * Send FCM notification for support ticket updates
 * @param {Array} userIds - Array of user IDs to send notifications to
 * @param {Object} ticket - Support ticket object
 * @param {Object} message - Support message object (optional)
 * @param {string} action - Action type (new_message, new_ticket, status_change, admin_reply)
 * @returns {Promise<Object>} - Result object
 */
exports.sendSupportFCMNotification = async (userIds, ticket, message = null, action = 'new_message') => {
  try {
    let title, body, data;

    switch (action) {
      case 'new_ticket':
        title = '🎫 New Support Ticket';
        body = `"${ticket.subject}" from ${ticket.user?.name || 'Unknown User'}`;
        data = {
          type: 'support_ticket',
          action: 'new_ticket',
          ticketId: ticket.id,
          ticketNumber: ticket.ticket_number,
          category: ticket.category,
          priority: ticket.priority,
          senderName: ticket.user?.name
        };
        break;
      
      case 'new_message':
        title = '💬 New Support Message';
        body = `New message in "${ticket.subject}" from ${message?.sender?.name || 'Unknown User'}`;
        data = {
          type: 'support_message',
          action: 'new_message',
          ticketId: ticket.id,
          ticketNumber: ticket.ticket_number,
          category: ticket.category,
          priority: ticket.priority,
          messageId: message?.id,
          senderName: message?.sender?.name
        };
        break;
      
      case 'admin_reply':
        title = '👨‍💼 Admin Reply';
        body = `Admin replied to your support ticket "${ticket.subject}"`;
        data = {
          type: 'support_reply',
          action: 'admin_reply',
          ticketId: ticket.id,
          ticketNumber: ticket.ticket_number,
          category: ticket.category,
          priority: ticket.priority,
          messageId: message?.id,
          adminName: message?.sender?.name
        };
        break;
      
      case 'status_change':
        title = '📋 Ticket Status Updated';
        body = `Your support ticket "${ticket.subject}" status changed to ${ticket.status}`;
        data = {
          type: 'support_status',
          action: 'status_change',
          ticketId: ticket.id,
          ticketNumber: ticket.ticket_number,
          category: ticket.category,
          priority: ticket.priority,
          oldStatus: ticket.oldStatus,
          newStatus: ticket.status
        };
        break;
      
      default:
        title = '🔔 Support Update';
        body = `Update on your support ticket "${ticket.subject}"`;
        data = {
          type: 'support_update',
          action: action,
          ticketId: ticket.id,
          ticketNumber: ticket.ticket_number,
          category: ticket.category,
          priority: ticket.priority
        };
    }

    // Add common data (FCM requires all data values to be strings)
    data.timestamp = new Date().toISOString();
    data.clickAction = 'OPEN_SUPPORT_TICKET';
    
    // Convert all data values to strings for FCM compatibility
    const stringData = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        stringData[key] = String(data[key]);
      }
    });

    return await exports.sendToUsers(userIds, title, body, stringData);

  } catch (error) {
    console.error('Error sending support FCM notification:', error);
    return {
      success: 0,
      failure: 1,
      total: 0,
      error: error.message
    };
  }
}; 