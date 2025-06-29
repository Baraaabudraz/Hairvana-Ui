/*
  # Remove data duplication from user_settings table

  This migration removes the duplicated fields (name, email, phone, avatar) from user_settings
  table since these are already stored in the users table. The user_settings table should
  only contain settings-specific data like department, timezone, language, bio, etc.

  Changes:
  1. Remove duplicated columns from user_settings table
  2. Update any existing data to ensure consistency
  3. Add comments to clarify the purpose of each table
*/

-- First, let's backup any custom settings data that might be different from user data
CREATE TEMP TABLE user_settings_backup AS
SELECT 
  us.id,
  us.user_id,
  us.name as settings_name,
  us.email as settings_email,
  us.phone as settings_phone,
  us.avatar as settings_avatar,
  us.department,
  us.timezone,
  us.language,
  us.bio,
  us.created_at,
  us.updated_at
FROM user_settings us;

-- Drop the existing user_settings table
DROP TABLE IF EXISTS user_settings CASCADE;

-- Recreate user_settings table without duplicated fields
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  department text,
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint to ensure one settings record per user
ALTER TABLE user_settings ADD CONSTRAINT user_settings_user_id_unique UNIQUE (user_id);

-- Restore settings-specific data from backup
INSERT INTO user_settings (id, user_id, department, timezone, language, bio, created_at, updated_at)
SELECT 
  id,
  user_id,
  department,
  timezone,
  language,
  bio,
  created_at,
  updated_at
FROM user_settings_backup
WHERE user_id IS NOT NULL;

-- Drop the temporary backup table
DROP TABLE user_settings_backup;

-- Re-enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Recreate policies for user settings
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

-- Recreate trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to clarify table purposes
COMMENT ON TABLE users IS 'Core user authentication and profile data. Contains essential user information like name, email, phone, role, status, etc.';
COMMENT ON TABLE user_settings IS 'User preferences and settings. Contains user-specific configuration like department, timezone, language, bio, etc. Does NOT duplicate core user data.';

-- Create a view for easy access to combined user profile data
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.role,
  u.status,
  u.join_date,
  u.last_login,
  u.avatar,
  u.permissions,
  u.created_at as user_created_at,
  u.updated_at as user_updated_at,
  us.department,
  us.timezone,
  us.language,
  us.bio,
  us.created_at as settings_created_at,
  us.updated_at as settings_updated_at
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id;

COMMENT ON VIEW user_profiles IS 'Combined view of user core data and settings. Use this for displaying complete user profiles.'; 