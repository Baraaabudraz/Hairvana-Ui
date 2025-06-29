// Get user settings
exports.getUserSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Get user core data from users table
    const { data: userData, error: userError } = await req.supabase
      .from('users')
      .select('id, name, email, phone, avatar, role, status, join_date, last_login')
      .eq('id', userId)
      .single();
    
    if (userError) {
      return res.status(500).json({ error: userError.message });
    }
    
    // Get user profile settings (only settings-specific data)
    const { data: userProfile, error: profileError } = await req.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return res.status(500).json({ error: profileError.message });
    }
    
    // Get security settings
    const { data: securitySettings, error: securityError } = await req.supabase
      .from('security_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (securityError && securityError.code !== 'PGRST116') {
      return res.status(500).json({ error: securityError.message });
    }
    
    // Get notification preferences
    const { data: notificationPrefs, error: notifError } = await req.supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (notifError && notifError.code !== 'PGRST116') {
      return res.status(500).json({ error: notifError.message });
    }
    
    // Get billing settings
    const { data: billingSettings, error: billingError } = await req.supabase
      .from('billing_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (billingError && billingError.code !== 'PGRST116') {
      return res.status(500).json({ error: billingError.message });
    }
    
    // Get backup settings
    const { data: backupSettings, error: backupError } = await req.supabase
      .from('backup_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (backupError && backupError.code !== 'PGRST116') {
      return res.status(500).json({ error: backupError.message });
    }
    
    // Combine user data with settings
    const combinedProfile = {
      ...userData,
      ...(userProfile || {})
    };
    
    res.json({
      profile: combinedProfile,
      security: securitySettings || {},
      notifications: notificationPrefs || {},
      billing: billingSettings || {},
      backup: backupSettings || {}
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
    
    // Core user fields that should be updated in users table
    const userFields = ['name', 'email', 'phone', 'avatar'];
    // Settings fields that should be updated in user_settings table
    const settingsFields = ['department', 'timezone', 'language', 'bio'];
    
    // Categorize the data
    Object.keys(profileData).forEach(key => {
      if (userFields.includes(key)) {
        userData[key] = profileData[key];
      } else if (settingsFields.includes(key)) {
        settingsData[key] = profileData[key];
      }
    });
    
    let userResult = null;
    let settingsResult = null;
    
    // Update core user data if any user fields are provided
    if (Object.keys(userData).length > 0) {
      const { data, error } = await req.supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      userResult = data;
    }
    
    // Update settings data if any settings fields are provided
    if (Object.keys(settingsData).length > 0) {
      // Check if settings exist
      const { data: existingSettings } = await req.supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (existingSettings) {
        // Update existing settings
        const { data, error } = await req.supabase
          .from('user_settings')
          .update(settingsData)
          .eq('user_id', userId)
          .select()
          .single();
        
        if (error) throw error;
        settingsResult = data;
      } else {
        // Create new settings
        const { data, error } = await req.supabase
          .from('user_settings')
          .insert({ ...settingsData, user_id: userId })
          .select()
          .single();
        
        if (error) throw error;
        settingsResult = data;
      }
    }
    
    // Combine results
    const result = {
      ...userResult,
      ...settingsResult
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
  try {
    const userId = req.user.userId;
    const securityData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await req.supabase
      .from('security_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await req.supabase
        .from('security_settings')
        .update(securityData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await req.supabase
        .from('security_settings')
        .insert({ ...securityData, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    res.json({
      message: 'Security settings updated successfully',
      settings: result
    });
  } catch (error) {
    next(error);
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const notificationData = req.body;
    
    // Check if preferences exist
    const { data: existingPrefs } = await req.supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    if (existingPrefs) {
      // Update existing preferences
      const { data, error } = await req.supabase
        .from('notification_preferences')
        .update(notificationData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new preferences
      const { data, error } = await req.supabase
        .from('notification_preferences')
        .insert({ ...notificationData, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    res.json({
      message: 'Notification preferences updated successfully',
      settings: result
    });
  } catch (error) {
    next(error);
  }
};

// Update billing settings
exports.updateBillingSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const billingData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await req.supabase
      .from('billing_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await req.supabase
        .from('billing_settings')
        .update(billingData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await req.supabase
        .from('billing_settings')
        .insert({ ...billingData, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    res.json({
      message: 'Billing settings updated successfully',
      settings: result
    });
  } catch (error) {
    next(error);
  }
};

// Update backup settings
exports.updateBackupSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const backupData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await req.supabase
      .from('backup_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await req.supabase
        .from('backup_settings')
        .update(backupData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await req.supabase
        .from('backup_settings')
        .insert({ ...backupData, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    res.json({
      message: 'Backup settings updated successfully',
      settings: result
    });
  } catch (error) {
    next(error);
  }
};

// Get platform settings (admin only)
exports.getPlatformSettings = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to access platform settings' });
    }
    
    // Get platform settings
    const { data, error } = await req.supabase
      .from('platform_settings')
      .select('*')
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || {});
  } catch (error) {
    next(error);
  }
};

// Update platform settings (admin only)
exports.updatePlatformSettings = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to update platform settings' });
    }
    
    const platformData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await req.supabase
      .from('platform_settings')
      .select('id')
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await req.supabase
        .from('platform_settings')
        .update(platformData)
        .eq('id', existingSettings.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await req.supabase
        .from('platform_settings')
        .insert(platformData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    res.json({
      message: 'Platform settings updated successfully',
      settings: result
    });
  } catch (error) {
    next(error);
  }
};

// Get integration settings (admin only)
exports.getIntegrationSettings = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to access integration settings' });
    }
    
    // Get integration settings
    const { data, error } = await req.supabase
      .from('integration_settings')
      .select('*')
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || {});
  } catch (error) {
    next(error);
  }
};

// Update integration settings (admin only)
exports.updateIntegrationSettings = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to update integration settings' });
    }
    
    const integrationData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await req.supabase
      .from('integration_settings')
      .select('id')
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await req.supabase
        .from('integration_settings')
        .update(integrationData)
        .eq('id', existingSettings.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await req.supabase
        .from('integration_settings')
        .insert(integrationData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    res.json({
      message: 'Integration settings updated successfully',
      settings: result
    });
  } catch (error) {
    next(error);
  }
};