/*
  # Create settings tables

  1. New Tables
    - `user_settings` - User profile settings
    - `security_settings` - User security settings
    - `notification_preferences` - User notification preferences
    - `billing_settings` - User billing settings
    - `backup_settings` - User backup settings
    - `platform_settings` - Global platform settings
    - `integration_settings` - Integration settings
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own settings
    - Add policies for admins to read/write all settings
*/

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  department text,
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  bio text,
  avatar text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Security Settings Table
CREATE TABLE IF NOT EXISTS security_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  two_factor_enabled boolean DEFAULT false,
  password_last_changed timestamptz,
  login_attempts integer DEFAULT 0,
  last_login_ip text,
  allowed_ips text[],
  session_timeout integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email boolean DEFAULT true,
  push boolean DEFAULT true,
  sms boolean DEFAULT false,
  desktop boolean DEFAULT true,
  marketing_emails boolean DEFAULT true,
  system_notifications boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Billing Settings Table
CREATE TABLE IF NOT EXISTS billing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  default_payment_method jsonb,
  billing_address jsonb,
  tax_id text,
  invoice_email text,
  auto_pay boolean DEFAULT true,
  payment_methods jsonb[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Backup Settings Table
CREATE TABLE IF NOT EXISTS backup_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  auto_backup boolean DEFAULT true,
  backup_frequency text DEFAULT 'daily',
  backup_time time DEFAULT '00:00:00',
  retention_days integer DEFAULT 30,
  storage_provider text DEFAULT 'local',
  storage_path text,
  cloud_credentials jsonb,
  last_backup timestamptz,
  backup_history jsonb[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Platform Settings Table
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text DEFAULT 'Hairvana',
  site_description text DEFAULT 'Professional Salon Management Platform',
  logo text,
  favicon text,
  primary_color text DEFAULT '#8b5cf6',
  secondary_color text DEFAULT '#ec4899',
  timezone text DEFAULT 'UTC',
  currency text DEFAULT 'USD',
  language text DEFAULT 'en',
  maintenance_mode boolean DEFAULT false,
  registration_enabled boolean DEFAULT true,
  email_verification_required boolean DEFAULT true,
  max_file_upload_size integer DEFAULT 10,
  allowed_file_types text[] DEFAULT ARRAY['jpg', 'jpeg', 'png', 'gif', 'pdf'],
  session_timeout integer DEFAULT 30,
  password_policy jsonb DEFAULT '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special_chars": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Integration Settings Table
CREATE TABLE IF NOT EXISTS integration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_provider text DEFAULT 'sendgrid',
  email_api_key text,
  sms_provider text DEFAULT 'twilio',
  sms_api_key text,
  payment_gateway text DEFAULT 'stripe',
  payment_api_key text,
  analytics_provider text DEFAULT 'google',
  analytics_tracking_id text,
  social_logins jsonb DEFAULT '{"google": true, "facebook": false, "apple": false}',
  webhooks jsonb[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user settings
CREATE POLICY "Users can read their own settings"
  ON user_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for security settings
CREATE POLICY "Users can read their own security settings"
  ON security_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings"
  ON security_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings"
  ON security_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for notification preferences
CREATE POLICY "Users can read their own notification preferences"
  ON notification_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON notification_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for billing settings
CREATE POLICY "Users can read their own billing settings"
  ON billing_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing settings"
  ON billing_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billing settings"
  ON billing_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for backup settings
CREATE POLICY "Users can read their own backup settings"
  ON backup_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own backup settings"
  ON backup_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own backup settings"
  ON backup_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policies for platform settings (admin only)
CREATE POLICY "Admins can read platform settings"
  ON platform_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

CREATE POLICY "Admins can update platform settings"
  ON platform_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

CREATE POLICY "Admins can insert platform settings"
  ON platform_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

-- Create policies for integration settings (admin only)
CREATE POLICY "Admins can read integration settings"
  ON integration_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

CREATE POLICY "Admins can update integration settings"
  ON integration_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

CREATE POLICY "Admins can insert integration settings"
  ON integration_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

-- Create update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at
BEFORE UPDATE ON security_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_settings_updated_at
BEFORE UPDATE ON billing_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_backup_settings_updated_at
BEFORE UPDATE ON backup_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON platform_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_settings_updated_at
BEFORE UPDATE ON integration_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();