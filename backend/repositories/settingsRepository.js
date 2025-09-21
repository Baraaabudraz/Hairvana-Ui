const {
  User,
  UserSettings,
  BillingSettings,
  IntegrationSettings,
  Role,
  NotificationPreferences,
  PlatformSettings,
} = require("../models");

exports.getUserSettings = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      { model: UserSettings, as: "userSettings" },
      { model: Role, as: "role" },
    ],
  });
  if (!user) throw new Error("User not found");
  const settings = user.userSettings || {};
  let billing = await BillingSettings.findOne({ where: { user_id: userId } });
  let billingData = {};
  if (billing) billingData = billing.get({ plain: true });
  return {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role_id: user.role_id,
      role: user.role ? user.role.name : undefined,
      status: user.status,
      join_date: user.join_date,
      last_login: user.last_login,
      department: settings.department || "Administration",
      timezone: settings.timezone || "America/New_York",
      language: settings.language || "en",
      bio: settings.bio || "",
    },
    security: {},
    notifications: {},
    billing: billingData,
    backup: {},
  };
};

exports.updateProfileSettings = async (userId, profileData) => {
  const userData = {};
  const settingsData = {};
  const userFields = ["name", "email", "phone", "avatar"];
  const settingsFields = ["department", "timezone", "language", "bio"];
  Object.keys(profileData).forEach((key) => {
    if (userFields.includes(key)) userData[key] = profileData[key];
    else if (settingsFields.includes(key)) settingsData[key] = profileData[key];
  });
  let userResult = null;
  let settingsResult = null;
  if (Object.keys(userData).length > 0) {
    userResult = await User.update(userData, {
      where: { id: userId },
      returning: true,
      plain: true,
    });
  }
  if (Object.keys(settingsData).length > 0) {
    let userSettings = await UserSettings.findOne({
      where: { user_id: userId },
    });
    if (userSettings) {
      await userSettings.update(settingsData);
      settingsResult = userSettings;
    } else {
      settingsResult = await UserSettings.create({
        ...settingsData,
        user_id: userId,
      });
    }
  }
  return {
    ...(userResult && userResult[1] ? userResult[1].get({ plain: true }) : {}),
    ...(settingsResult ? settingsResult.get({ plain: true }) : {}),
  };
};

exports.updateSecuritySettings = async () => {
  throw new Error("Not implemented: updateSecuritySettings");
};

exports.getNotificationPreferences = async (userId) => {
  if (!userId) throw new Error('User ID is required');

  try {
    let notificationPreferences = await NotificationPreferences.findOne({
      where: { user_id: userId }
    });

    if (!notificationPreferences) {
      // Create default preferences if they don't exist
      notificationPreferences = await NotificationPreferences.create({
        user_id: userId,
        email: true,
        push: true,
        sms: false,
        desktop: true,
        marketing_emails: true,
        system_notifications: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return notificationPreferences.get({ plain: true });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw new Error('Failed to get notification preferences: ' + error.message);
  }
};

exports.updateNotificationPreferences = async (userId, preferencesData) => {
  if (!userId) throw new Error('User ID is required');
  if (!preferencesData || typeof preferencesData !== 'object') {
    throw new Error('Notification preferences data is required');
  }

  try {
    // Check if notification preferences exist for this user
    let notificationPreferences = await NotificationPreferences.findOne({
      where: { user_id: userId }
    });

    if (notificationPreferences) {
      // Update existing preferences
      await notificationPreferences.update({
        ...preferencesData,
        updated_at: new Date()
      });
    } else {
      // Create new preferences if they don't exist
      notificationPreferences = await NotificationPreferences.create({
        user_id: userId,
        ...preferencesData,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return {
      message: 'Notification preferences updated successfully',
      preferences: notificationPreferences.get({ plain: true })
    };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw new Error('Failed to update notification preferences: ' + error.message);
  }
};

exports.updateBillingSettings = async (userId, data) => {
  if (
    !data.invoice_email ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.invoice_email)
  ) {
    throw new Error("invoice_email is required and must be a valid email");
  }
  if (
    !data.default_payment_method ||
    typeof data.default_payment_method !== "string"
  ) {
    throw new Error("default_payment_method is required and must be a string");
  }
  if (!data.billing_address || typeof data.billing_address !== "string") {
    throw new Error("billing_address is required and must be a string");
  }
  if (data.auto_pay !== undefined && typeof data.auto_pay !== "boolean") {
    throw new Error("auto_pay must be a boolean");
  }
  if (data.tax_id && typeof data.tax_id !== "string") {
    throw new Error("tax_id must be a string");
  }
  if (typeof data.payment_methods === "string") {
    try {
      data.payment_methods = JSON.parse(data.payment_methods);
    } catch {
      if (data.payment_methods === "[]") data.payment_methods = [];
      else throw new Error("payment_methods must be valid JSON");
    }
  }
  if (
    !Array.isArray(data.payment_methods) &&
    typeof data.payment_methods !== "object"
  ) {
    data.payment_methods = [];
  }
  let billing = await BillingSettings.findOne({ where: { user_id: userId } });
  if (billing) {
    await billing.update(data);
  } else {
    billing = await BillingSettings.create({ ...data, user_id: userId });
  }
  return {
    message: "Billing settings updated",
    billing: billing.get({ plain: true }),
  };
};

exports.updateBackupSettings = async () => {
  throw new Error("Not implemented: updateBackupSettings");
};

exports.getPlatformSettings = async () => {
  try {
    let platformSettings = await PlatformSettings.findOne();
    
    if (!platformSettings) {
      // Create default platform settings if none exist
      platformSettings = await PlatformSettings.create({
        site_name: 'Hairvana',
        site_description: 'Professional Salon Management Platform',
        primary_color: '#8b5cf6',
        secondary_color: '#ec4899',
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        maintenance_mode: false,
        registration_enabled: true,
        email_verification_required: true,
        max_file_upload_size: 10,
        allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
        session_timeout: 30,
        password_policy: {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_special_chars: true
        },
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return platformSettings.get({ plain: true });
  } catch (error) {
    console.error('Error getting platform settings:', error);
    throw new Error('Failed to get platform settings: ' + error.message);
  }
};

exports.updatePlatformSettings = async (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Platform settings data is required');
  }

  try {
    let platformSettings = await PlatformSettings.findOne();
    
    // Prepare update data with validation
    const updateData = { ...data };
    
    // File paths are now stored as filenames only
    // No validation needed since we store just the filename
    
    // Validate color codes if provided
    if (updateData.primary_color && !/^#[0-9A-Fa-f]{6}$/.test(updateData.primary_color)) {
      throw new Error('Primary color must be a valid hex color code (e.g., #8b5cf6)');
    }
    
    if (updateData.secondary_color && !/^#[0-9A-Fa-f]{6}$/.test(updateData.secondary_color)) {
      throw new Error('Secondary color must be a valid hex color code (e.g., #ec4899)');
    }
    
    // Validate file upload size
    if (updateData.max_file_upload_size && (isNaN(updateData.max_file_upload_size) || updateData.max_file_upload_size < 1)) {
      throw new Error('Max file upload size must be a positive number');
    }
    
    // Validate session timeout
    if (updateData.session_timeout && (isNaN(updateData.session_timeout) || updateData.session_timeout < 5)) {
      throw new Error('Session timeout must be at least 5 minutes');
    }
    
    if (platformSettings) {
      // Update existing settings
      await platformSettings.update({
        ...updateData,
        updated_at: new Date()
      });
    } else {
      // Create new settings if none exist
      platformSettings = await PlatformSettings.create({
        ...updateData,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    return {
      message: 'Platform settings updated successfully',
      settings: platformSettings.get({ plain: true })
    };
  } catch (error) {
    console.error('Error updating platform settings:', error);
    throw new Error('Failed to update platform settings: ' + error.message);
  }
};

exports.getIntegrationSettings = async () => {
  const settings = await IntegrationSettings.findOne();
  if (!settings) throw new Error("Integration settings not found");
  return settings;
};

exports.updateIntegrationSettings = async (data) => {
  let settings = await IntegrationSettings.findOne();
  if (!settings) {
    settings = await IntegrationSettings.create(data);
  } else {
    await settings.update(data);
  }
  return { message: "Integration settings updated", settings };
};
