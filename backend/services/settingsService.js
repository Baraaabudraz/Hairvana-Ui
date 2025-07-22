const settingsRepository = require('../repositories/settingsRepository');

exports.getUserSettings = async (userId) => {
  if (!userId) throw new Error('User ID is required');
  try {
    return await settingsRepository.getUserSettings(userId);
  } catch (err) {
    throw new Error('Failed to get user settings: ' + err.message);
  }
};

exports.updateProfileSettings = async (userId, profileData) => {
  if (!userId) throw new Error('User ID is required');
  if (!profileData || typeof profileData !== 'object') throw new Error('Profile data is required');
  try {
    return await settingsRepository.updateProfileSettings(userId, profileData);
  } catch (err) {
    throw new Error('Failed to update profile settings: ' + err.message);
  }
};

exports.updateSecuritySettings = async (userId, data) => {
  if (!userId) throw new Error('User ID is required');
  throw new Error('Not implemented: updateSecuritySettings');
};

exports.updateNotificationPreferences = async (userId, data) => {
  if (!userId) throw new Error('User ID is required');
  throw new Error('Not implemented: updateNotificationPreferences');
};

exports.updateBillingSettings = async (userId, data) => {
  if (!userId) throw new Error('User ID is required');
  if (!data || typeof data !== 'object') throw new Error('Billing data is required');
  if (!data.invoice_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.invoice_email)) {
    throw new Error('invoice_email is required and must be a valid email');
  }
  if (!data.default_payment_method || typeof data.default_payment_method !== 'string') {
    throw new Error('default_payment_method is required and must be a string');
  }
  if (!data.billing_address || typeof data.billing_address !== 'string') {
    throw new Error('billing_address is required and must be a string');
  }
  try {
    return await settingsRepository.updateBillingSettings(userId, data);
  } catch (err) {
    throw new Error('Failed to update billing settings: ' + err.message);
  }
};

exports.updateBackupSettings = async (userId, data) => {
  if (!userId) throw new Error('User ID is required');
  throw new Error('Not implemented: updateBackupSettings');
};

exports.getPlatformSettings = async () => {
  try {
    return await settingsRepository.getPlatformSettings();
  } catch (err) {
    throw new Error('Failed to get platform settings: ' + err.message);
  }
};

exports.updatePlatformSettings = async (data) => {
  if (!data || typeof data !== 'object') throw new Error('Platform settings data is required');
  throw new Error('Not implemented: updatePlatformSettings');
};

exports.getIntegrationSettings = async () => {
  try {
    return await settingsRepository.getIntegrationSettings();
  } catch (err) {
    throw new Error('Failed to get integration settings: ' + err.message);
  }
};

exports.updateIntegrationSettings = async (data) => {
  if (!data || typeof data !== 'object') throw new Error('Integration settings data is required');
  try {
    return await settingsRepository.updateIntegrationSettings(data);
  } catch (err) {
    throw new Error('Failed to update integration settings: ' + err.message);
  }
}; 