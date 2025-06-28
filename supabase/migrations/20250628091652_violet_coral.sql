-- This migration creates the initial admin users if they don't exist

-- Create super admin user
INSERT INTO users (id, email, name, phone, role, status, join_date, avatar, permissions, password_hash)
SELECT 
  '00000000-0000-0000-0000-000000000001', 
  'superadmin@hairvana.com', 
  'Sarah Johnson', 
  '+1 (555) 234-5678', 
  'super_admin', 
  'active', 
  '2024-01-01', 
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2', 
  ARRAY['full_access']::text[], 
  '$2a$10$XHCm0tGpT0Yw1XcCRHZM8.WW8Zq4kvVnJHtHxHeFpHl.jnJjFIzLa' -- hashed 'admin123'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'superadmin@hairvana.com'
);

-- Create admin user
INSERT INTO users (id, email, name, phone, role, status, join_date, avatar, permissions, password_hash)
SELECT 
  '00000000-0000-0000-0000-000000000002', 
  'admin@hairvana.com', 
  'John Smith', 
  '+1 (555) 123-4567', 
  'admin', 
  'active', 
  '2024-01-01', 
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2', 
  ARRAY['manage_salons', 'manage_users', 'view_analytics', 'manage_subscriptions']::text[], 
  '$2a$10$XHCm0tGpT0Yw1XcCRHZM8.WW8Zq4kvVnJHtHxHeFpHl.jnJjFIzLa' -- hashed 'admin123'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@hairvana.com'
);

-- Create platform settings if they don't exist
INSERT INTO platform_settings (site_name, site_description, primary_color, secondary_color)
SELECT 
  'Hairvana', 
  'Professional Salon Management Platform', 
  '#8b5cf6', 
  '#ec4899'
WHERE NOT EXISTS (
  SELECT 1 FROM platform_settings
);

-- Create integration settings if they don't exist
INSERT INTO integration_settings (email_provider, sms_provider, payment_gateway, analytics_provider)
SELECT 
  'sendgrid', 
  'twilio', 
  'stripe', 
  'google'
WHERE NOT EXISTS (
  SELECT 1 FROM integration_settings
);