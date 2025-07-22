const settingsService = require('../services/settingsService');

exports.getUserSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getUserSettings(req.user.userId);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

exports.updateProfileSettings = async (req, res, next) => {
  try {
    const result = await settingsService.updateProfileSettings(req.user.userId, req.body);
    res.json({
      message: 'Profile settings updated successfully',
      settings: result
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSecuritySettings = async (req, res, next) => {
  try {
    const result = await settingsService.updateSecuritySettings(req.user.userId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const result = await settingsService.updateNotificationPreferences(req.user.userId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateBillingSettings = async (req, res, next) => {
  try {
    const result = await settingsService.updateBillingSettings(req.user.userId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateBackupSettings = async (req, res, next) => {
  try {
    const result = await settingsService.updateBackupSettings(req.user.userId, req.body);
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