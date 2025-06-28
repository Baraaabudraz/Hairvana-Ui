-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement', 'promotion')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  target_audience text NOT NULL CHECK (target_audience IN ('all', 'salons', 'users', 'admins', 'custom')),
  channels text[] NOT NULL,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL,
  created_by text NOT NULL,
  recipients jsonb NOT NULL DEFAULT '{"total": 0, "sent": 0, "delivered": 0, "opened": 0, "clicked": 0}',
  custom_filters jsonb,
  created_at_timestamp timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement', 'promotion')),
  category text NOT NULL CHECK (category IN ('system', 'marketing', 'transactional', 'operational')),
  subject text NOT NULL,
  content text NOT NULL,
  channels text[] NOT NULL,
  variables text[] NOT NULL,
  popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Admins can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

-- Create policies for notification templates
CREATE POLICY "Admins can manage all notification templates"
  ON notification_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.role = 'admin' OR users.role = 'super_admin')
    )
  );

CREATE POLICY "All users can read notification templates"
  ON notification_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Create update triggers for timestamps
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON notifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
BEFORE UPDATE ON notification_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed notification templates
INSERT INTO notification_templates (id, name, description, type, category, subject, content, channels, variables, popular)
VALUES
  (
    'welcome-salon',
    'Welcome New Salon',
    'Welcome message for newly registered salons',
    'success',
    'transactional',
    'Welcome to Hairvana! 🎉',
    'Welcome {{salonName}} to the Hairvana platform! We''re excited to help you grow your business.',
    ARRAY['email', 'in-app'],
    ARRAY['salonName', 'ownerName', 'setupLink'],
    true
  ),
  (
    'subscription-reminder',
    'Subscription Renewal Reminder',
    'Remind salons about upcoming subscription renewal',
    'warning',
    'transactional',
    'Your subscription expires in 3 days',
    'Hi {{ownerName}}, your {{planName}} subscription for {{salonName}} expires on {{expiryDate}}.',
    ARRAY['email', 'push', 'in-app'],
    ARRAY['ownerName', 'salonName', 'planName', 'expiryDate', 'renewLink'],
    true
  ),
  (
    'platform-update',
    'Platform Update Announcement',
    'Notify users about new features and updates',
    'announcement',
    'operational',
    'New Features Available! 🚀',
    'We''ve added exciting new features to improve your experience. Check out what''s new!',
    ARRAY['email', 'push', 'in-app'],
    ARRAY['featureList', 'updateDate', 'learnMoreLink'],
    false
  ),
  (
    'promotional-offer',
    'Promotional Offer',
    'Send promotional offers and discounts',
    'promotion',
    'marketing',
    'Special Offer: {{discountPercent}}% Off!',
    'Limited time offer! Get {{discountPercent}}% off your next subscription upgrade.',
    ARRAY['email', 'push'],
    ARRAY['discountPercent', 'offerCode', 'expiryDate', 'upgradeLink'],
    true
  ),
  (
    'system-maintenance',
    'System Maintenance Notice',
    'Notify about scheduled maintenance',
    'warning',
    'system',
    'Scheduled Maintenance: {{maintenanceDate}}',
    'We''ll be performing system maintenance on {{maintenanceDate}} from {{startTime}} to {{endTime}}.',
    ARRAY['email', 'in-app'],
    ARRAY['maintenanceDate', 'startTime', 'endTime', 'duration'],
    false
  ),
  (
    'payment-failed',
    'Payment Failed Alert',
    'Alert when payment processing fails',
    'error',
    'transactional',
    'Payment Failed - Action Required',
    'We couldn''t process your payment for {{salonName}}. Please update your payment method.',
    ARRAY['email', 'push', 'in-app'],
    ARRAY['salonName', 'amount', 'failureReason', 'updateLink'],
    false
  );