const { supabase } = require('../lib/supabase');

// Get user settings
exports.getUserSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user profile settings
    const { data: userProfile, error: profileError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return res.status(500).json({ error: profileError.message });
    }
    
    // Get security settings
    const { data: securitySettings, error: securityError } = await supabase
      .from('security_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (securityError && securityError.code !== 'PGRST116') {
      return res.status(500).json({ error: securityError.message });
    }
    
    // Get notification preferences
    const { data: notificationPrefs, error: notifError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (notifError && notifError.code !== 'PGRST116') {
      return res.status(500).json({ error: notifError.message });
    }
    
    // Get billing settings
    const { data: billingSettings, error: billingError } = await supabase
      .from('billing_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (billingError && billingError.code !== 'PGRST116') {
      return res.status(500).json({ error: billingError.message });
    }
    
    // Get backup settings
    const { data: backupSettings, error: backupError } = await supabase
      .from('backup_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (backupError && backupError.code !== 'PGRST116') {
      return res.status(500).json({ error: backupError.message });
    }
    
    res.json({
      profile: userProfile || {},
      security: securitySettings || {},
      notifications: notificationPrefs || {},
      billing: billingSettings || {},
      backup: backupSettings || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile settings
exports.updateProfileSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const profileData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('user_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from('user_settings')
        .insert({ ...profileData, user_id: userId })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    res.json({
      message: 'Profile settings updated successfully',
      settings: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update security settings
exports.updateSecuritySettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const securityData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('security_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('security_settings')
        .update(securityData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
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
    res.status(500).json({ error: error.message });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationData = req.body;
    
    // Check if preferences exist
    const { data: existingPrefs } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    if (existingPrefs) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(notificationData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new preferences
      const { data, error } = await supabase
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
    res.status(500).json({ error: error.message });
  }
};

// Update billing settings
exports.updateBillingSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const billingData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('billing_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('billing_settings')
        .update(billingData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
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
    res.status(500).json({ error: error.message });
  }
};

// Update backup settings
exports.updateBackupSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const backupData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('backup_settings')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('backup_settings')
        .update(backupData)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
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
    res.status(500).json({ error: error.message });
  }
};

// Get platform settings (admin only)
exports.getPlatformSettings = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to access platform settings' });
    }
    
    // Get platform settings
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update platform settings (admin only)
exports.updatePlatformSettings = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to update platform settings' });
    }
    
    const platformData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('platform_settings')
      .select('id')
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('platform_settings')
        .update(platformData)
        .eq('id', existingSettings.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
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
    res.status(500).json({ error: error.message });
  }
};

// Get integration settings (admin only)
exports.getIntegrationSettings = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to access integration settings' });
    }
    
    // Get integration settings
    const { data, error } = await supabase
      .from('integration_settings')
      .select('*')
      .single();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update integration settings (admin only)
exports.updateIntegrationSettings = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to update integration settings' });
    }
    
    const integrationData = req.body;
    
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('integration_settings')
      .select('id')
      .single();
    
    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('integration_settings')
        .update(integrationData)
        .eq('id', existingSettings.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
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
    res.status(500).json({ error: error.message });
  }
};