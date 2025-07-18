const { User, UserSettings, BillingSettings, IntegrationSettings } = require('../models');

exports.getUserSettings = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{ model: UserSettings, as: 'userSettings' }]
  });
  if (!user) throw new Error('User not found');
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
  };
};

exports.updateProfileSettings = async (userId, profileData) => {
  const userData = {};
  const settingsData = {};
  const userFields = ['name', 'email', 'phone', 'avatar'];
  const settingsFields = ['department', 'timezone', 'language', 'bio'];
  Object.keys(profileData).forEach(key => {
    if (userFields.includes(key)) userData[key] = profileData[key];
    else if (settingsFields.includes(key)) settingsData[key] = profileData[key];
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
  return {
    ...(userResult && userResult[1] ? userResult[1].get({ plain: true }) : {}),
    ...(settingsResult ? settingsResult.get({ plain: true }) : {})
  };
};

exports.updateSecuritySettings = async () => {
  throw new Error('Not implemented: updateSecuritySettings');
};

exports.updateNotificationPreferences = async () => {
  throw new Error('Not implemented: updateNotificationPreferences');
};

exports.updateBillingSettings = async (userId, data) => {
  if (!data.invoice_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.invoice_email)) {
    throw new Error('invoice_email is required and must be a valid email');
  }
  if (!data.default_payment_method || typeof data.default_payment_method !== 'string') {
    throw new Error('default_payment_method is required and must be a string');
  }
  if (!data.billing_address || typeof data.billing_address !== 'string') {
    throw new Error('billing_address is required and must be a string');
  }
  if (data.auto_pay !== undefined && typeof data.auto_pay !== 'boolean') {
    throw new Error('auto_pay must be a boolean');
  }
  if (data.tax_id && typeof data.tax_id !== 'string') {
    throw new Error('tax_id must be a string');
  }
  if (typeof data.payment_methods === 'string') {
    try {
      data.payment_methods = JSON.parse(data.payment_methods);
    } catch {
      if (data.payment_methods === '[]') data.payment_methods = [];
      else throw new Error('payment_methods must be valid JSON');
    }
  }
  if (!Array.isArray(data.payment_methods) && typeof data.payment_methods !== 'object') {
    data.payment_methods = [];
  }
  let billing = await BillingSettings.findOne({ where: { user_id: userId } });
  if (billing) {
    await billing.update(data);
  } else {
    billing = await BillingSettings.create({ ...data, user_id: userId });
  }
  return { message: 'Billing settings updated', billing: billing.get({ plain: true }) };
};

exports.updateBackupSettings = async () => {
  throw new Error('Not implemented: updateBackupSettings');
};

exports.getPlatformSettings = async () => {
  throw new Error('Not implemented: getPlatformSettings');
};

exports.updatePlatformSettings = async () => {
  throw new Error('Not implemented: updatePlatformSettings');
};

exports.getIntegrationSettings = async () => {
  const settings = await IntegrationSettings.findOne();
  if (!settings) throw new Error('Integration settings not found');
  return settings;
};

exports.updateIntegrationSettings = async (data) => {
  let settings = await IntegrationSettings.findOne();
  if (!settings) {
    settings = await IntegrationSettings.create(data);
  } else {
    await settings.update(data);
  }
  return { message: 'Integration settings updated', settings };
}; 