// At the top of the file, import models
const { User, UserSettings, BillingSettings } = require('../models');
// TODO: Import or define Sequelize models for the following tables if/when they exist:
// SecuritySettings, NotificationPreferences, BackupSettings, PlatformSettings, IntegrationSettings

// Get user settings
exports.getUserSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      include: [{ model: UserSettings, as: 'userSettings' }]
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const settings = user.userSettings || {};
    // Fetch billing settings
    let billing = await BillingSettings.findOne({ where: { user_id: userId } });
    let billingData = {};
    if (billing) {
      billingData = billing.get({ plain: true });
    }
    res.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        join_date: user.join_date,
        last_login: user.last_login,
        department: settings.department || 'Administration',
        timezone: settings.timezone || 'America/New_York',
        language: settings.language || 'en',
        bio: settings.bio || ''
      },
      security: {},
      notifications: {},
      billing: billingData,
      backup: {}
    });
  } catch (error) {
    next(error);
  }
};

// Update profile settings
exports.updateProfileSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const profileData = req.body;
    // Separate core user data from settings data
    const userData = {};
    const settingsData = {};
    const userFields = ['name', 'email', 'phone', 'avatar'];
    const settingsFields = ['department', 'timezone', 'language', 'bio'];
    Object.keys(profileData).forEach(key => {
      if (userFields.includes(key)) {
        userData[key] = profileData[key];
      } else if (settingsFields.includes(key)) {
        settingsData[key] = profileData[key];
      }
    });
    let userResult = null;
    let settingsResult = null;
    if (Object.keys(userData).length > 0) {
      userResult = await User.update(userData, {
        where: { id: userId },
        returning: true,
        plain: true
      });
    }
    if (Object.keys(settingsData).length > 0) {
      let userSettings = await UserSettings.findOne({ where: { user_id: userId } });
      if (userSettings) {
        await userSettings.update(settingsData);
        settingsResult = userSettings;
      } else {
        settingsResult = await UserSettings.create({ ...settingsData, user_id: userId });
      }
    }
    const result = {
      ...(userResult && userResult[1] ? userResult[1].get({ plain: true }) : {}),
      ...(settingsResult ? settingsResult.get({ plain: true }) : {})
    };
    res.json({
      message: 'Profile settings updated successfully',
      settings: result
    });
  } catch (error) {
    next(error);
  }
};

// Update security settings
exports.updateSecuritySettings = async (req, res, next) => {
  // TODO: Implement with Sequelize model for security_settings
  return res.status(501).json({ error: 'Not implemented: updateSecuritySettings (Sequelize model missing)' });
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res, next) => {
  // TODO: Implement with Sequelize model for notification_preferences
  return res.status(501).json({ error: 'Not implemented: updateNotificationPreferences (Sequelize model missing)' });
};

// Update billing settings
exports.updateBillingSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const data = req.body;
    // Required fields
    if (!data.invoice_email || !/^\S+@\S+\.\S+$/.test(data.invoice_email)) {
      return res.status(400).json({ error: 'invoice_email is required and must be a valid email' });
    }
    if (!data.default_payment_method || typeof data.default_payment_method !== 'string') {
      return res.status(400).json({ error: 'default_payment_method is required and must be a string' });
    }
    if (!data.billing_address || typeof data.billing_address !== 'string') {
      return res.status(400).json({ error: 'billing_address is required and must be a string' });
    }
    // Optional fields validation
    if (data.auto_pay !== undefined && typeof data.auto_pay !== 'boolean') {
      return res.status(400).json({ error: 'auto_pay must be a boolean' });
    }
    if (data.tax_id && typeof data.tax_id !== 'string') {
      return res.status(400).json({ error: 'tax_id must be a string' });
    }
    // Force payment_methods to be a real array/object before saving
    if (typeof data.payment_methods === 'string') {
      try {
        data.payment_methods = JSON.parse(data.payment_methods);
      } catch {
        if (data.payment_methods === '[]') {
          data.payment_methods = [];
        } else {
          return res.status(400).json({ error: 'payment_methods must be valid JSON' });
        }
      }
    }
    if (!Array.isArray(data.payment_methods) && typeof data.payment_methods !== 'object') {
      data.payment_methods = [];
    }
    // Debug log for payment_methods
    console.log('payment_methods type:', typeof data.payment_methods, data.payment_methods);
    let billing = await BillingSettings.findOne({ where: { user_id: userId } });
    if (billing) {
      await billing.update(data);
    } else {
      billing = await BillingSettings.create({ ...data, user_id: userId });
    }
    res.json({ message: 'Billing settings updated', billing: billing.get({ plain: true }) });
  } catch (error) {
    console.error('Billing settings error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message, stack: error.stack });
  }
};

// Update backup settings
exports.updateBackupSettings = async (req, res, next) => {
  // TODO: Implement with Sequelize model for backup_settings
  return res.status(501).json({ error: 'Not implemented: updateBackupSettings (Sequelize model missing)' });
};

// Get platform settings (admin only)
exports.getPlatformSettings = async (req, res, next) => {
  // TODO: Implement with Sequelize model for platform_settings
  return res.status(501).json({ error: 'Not implemented: getPlatformSettings (Sequelize model missing)' });
};

// Update platform settings (admin only)
exports.updatePlatformSettings = async (req, res, next) => {
  // TODO: Implement with Sequelize model for platform_settings
  return res.status(501).json({ error: 'Not implemented: updatePlatformSettings (Sequelize model missing)' });
};

// Get integration settings (admin only)
exports.getIntegrationSettings = async (req, res, next) => {
  // TODO: Implement with Sequelize model for integration_settings
  return res.status(501).json({ error: 'Not implemented: getIntegrationSettings (Sequelize model missing)' });
};

// Update integration settings (admin only)
exports.updateIntegrationSettings = async (req, res, next) => {
  // TODO: Implement with Sequelize model for integration_settings
  return res.status(501).json({ error: 'Not implemented: updateIntegrationSettings (Sequelize model missing)' });
};