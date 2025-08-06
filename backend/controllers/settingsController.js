const settingsService = require('../services/settingsService');
const { serializeUserSettings } = require('../serializers/userSettingsSerializer');

exports.getUserSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getUserSettings(req.user.id);
    const serializedSettings = serializeUserSettings(settings, { req });
    res.json(serializedSettings);
  } catch (error) {
    next(error);
  }
};

exports.updateProfileSettings = async (req, res, next) => {
  try {
    // Handle avatar upload
    let profileData = { ...req.body };
    
    if (req.file) {
      profileData.avatar = req.file.filename;
    }
    
    const result = await settingsService.updateProfileSettings(req.user.id, profileData);
    
    // Get updated settings with proper serialization
    const updatedSettings = await settingsService.getUserSettings(req.user.id);
    const serializedSettings = serializeUserSettings(updatedSettings, { req });
    
    res.json({
      message: 'Profile settings updated successfully',
      settings: serializedSettings
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSecuritySettings = async (req, res, next) => {
  try {
    const result = await settingsService.updateSecuritySettings(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const result = await settingsService.updateNotificationPreferences(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateBillingSettings = async (req, res, next) => {
  try {
    const result = await settingsService.updateBillingSettings(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateBackupSettings = async (req, res, next) => {
  try {
    const result = await settingsService.updateBackupSettings(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getPlatformSettings = async (req, res, next) => {
  try {
    const result = await settingsService.getPlatformSettings();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updatePlatformSettings = async (req, res, next) => {
  try {
    const result = await settingsService.updatePlatformSettings(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getIntegrationSettings = async (req, res, next) => {
  try {
    const result = await settingsService.getIntegrationSettings();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateIntegrationSettings = async (req, res, next) => {
  try {
    const result = await settingsService.updateIntegrationSettings(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};