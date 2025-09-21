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

exports.getSecuritySettings = async (req, res, next) => {
  try {
    console.log('🔍 Security settings get request:', {
      userId: req.user?.id,
      userRole: req.user?.role,
      userEmail: req.user?.email,
      headers: req.headers
    });
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: 'User not authenticated or missing user ID',
        user: req.user 
      });
    }
    
    console.log('🔍 Calling repository with user ID:', req.user.id);
    const settings = await settingsService.getSecuritySettings(req.user.id);
    console.log('🔍 Security settings get result:', settings);
    res.json(settings);
  } catch (error) {
    console.error('❌ Security settings get error:', error);
    next(error);
  }
};

exports.updateSecuritySettings = async (req, res, next) => {
  try {
    console.log('Security settings update request:', {
      userId: req.user?.id,
      userRole: req.user?.role,
      body: req.body,
      headers: req.headers
    });
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: 'User not authenticated or missing user ID',
        user: req.user 
      });
    }
    
    const result = await settingsService.updateSecuritySettings(req.user.id, req.body);
    
    console.log('Security settings update result:', result);
    
    res.json(result);
  } catch (error) {
    console.error('Security settings update error:', error);
    next(error);
  }
};

exports.getNotificationPreferences = async (req, res, next) => {
  try {
    const preferences = await settingsService.getNotificationPreferences(req.user.id);
    res.json(preferences);
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
    console.log('Platform settings update request received');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    // Handle file uploads
    let platformData = { ...req.body };
    
    // Process allowed_file_types - convert string to array
    if (platformData.allowed_file_types && typeof platformData.allowed_file_types === 'string') {
      platformData.allowed_file_types = platformData.allowed_file_types.split(',').map(type => type.trim());
    }
    
    // Process password_policy - parse JSON string
    if (platformData.password_policy && typeof platformData.password_policy === 'string') {
      try {
        platformData.password_policy = JSON.parse(platformData.password_policy);
      } catch (error) {
        console.error('Error parsing password_policy:', error);
        platformData.password_policy = {
          min_length: 8,
          require_uppercase: true,
          require_lowercase: true,
          require_numbers: true,
          require_special_chars: true
        };
      }
    }
    
    // Process boolean values - convert string to boolean
    if (platformData.maintenance_mode && typeof platformData.maintenance_mode === 'string') {
      platformData.maintenance_mode = platformData.maintenance_mode === 'true';
    }
    if (platformData.registration_enabled && typeof platformData.registration_enabled === 'string') {
      platformData.registration_enabled = platformData.registration_enabled === 'true';
    }
    if (platformData.email_verification_required && typeof platformData.email_verification_required === 'string') {
      platformData.email_verification_required = platformData.email_verification_required === 'true';
    }
    
    // Process numeric values - convert string to number
    if (platformData.max_file_upload_size && typeof platformData.max_file_upload_size === 'string') {
      platformData.max_file_upload_size = parseInt(platformData.max_file_upload_size);
    }
    if (platformData.session_timeout && typeof platformData.session_timeout === 'string') {
      platformData.session_timeout = parseInt(platformData.session_timeout);
    }
    
    // Process logo upload
    if (req.files && req.files.logo && req.files.logo[0]) {
      const logoFile = req.files.logo[0];
      console.log('Processing logo file:', logoFile);
      platformData.logo = logoFile.filename; // Store only filename
    } else {
      console.log('No logo file received');
    }
    
    // Process favicon upload
    if (req.files && req.files.favicon && req.files.favicon[0]) {
      const faviconFile = req.files.favicon[0];
      console.log('Processing favicon file:', faviconFile);
      platformData.favicon = faviconFile.filename; // Store only filename
    } else {
      console.log('No favicon file received');
    }
    
    console.log('Final platform data:', platformData);
    
    const result = await settingsService.updatePlatformSettings(platformData);
    res.json(result);
  } catch (error) {
    console.error('Error updating platform settings:', error);
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