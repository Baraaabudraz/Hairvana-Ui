/*
  # Create subscriptions table

  1. New Tables
    - `subscription_plans`
      - `id` (text, primary key)
      - `name` (text)
      - `price` (numeric)
      - `yearly_price` (numeric)
      - `description` (text)
      - `features` (text[])
      - `limits` (jsonb)
      - `popular` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `subscriptions`
      - `id` (uuid, primary key)
      - `salon_id` (uuid, foreign key)
      - `plan_id` (text, foreign key)
      - `status` (text)
      - `start_date` (timestamptz)
      - `next_billing_date` (timestamptz)
      - `amount` (numeric)
      - `billing_cycle` (text)
      - `usage` (jsonb)
      - `payment_method` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `billing_history`
      - `id` (uuid, primary key)
      - `subscription_id` (uuid, foreign key)
      - `date` (timestamptz)
      - `amount` (numeric)
      - `status` (text)
      - `description` (text)
      - `invoice_number` (text)
      - `tax_amount` (numeric)
      - `subtotal` (numeric)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for salon owners and admins
*/

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  yearly_price numeric(10,2) NOT NULL,
  description text,
  features text[],
  limits jsonb,
  popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES subscription_plans(id),
  status text NOT NULL CHECK (status IN ('active', 'trial', 'cancelled', 'past_due')),
  start_date timestamptz NOT NULL DEFAULT now(),
  next_billing_date timestamptz NOT NULL,
  amount numeric(10,2) NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  usage jsonb,
  payment_method jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Billing History Table
CREATE TABLE IF NOT EXISTS billing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  date timestamptz NOT NULL DEFAULT now(),
  amount numeric(10,2) NOT NULL,
  status text NOT NULL CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
  description text,
  invoice_number text,
  tax_amount numeric(10,2),
  subtotal numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_plans
CREATE POLICY "Anyone can read subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subscription plans"
  ON subscription_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Create policies for subscriptions
CREATE POLICY "Salon owners can read their own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons
      WHERE salons.id = salon_id AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Create policies for billing_history
CREATE POLICY "Salon owners can read their own billing history"
  ON billing_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      JOIN salons ON subscriptions.salon_id = salons.id
      WHERE billing_history.subscription_id = subscriptions.id
      AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all billing history"
  ON billing_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

CREATE POLICY "Admins can manage all billing history"
  ON billing_history
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, price, yearly_price, description, features, limits, popular)
VALUES
  ('basic', 'Basic', 19.99, 199.99, 'Perfect for small salons getting started', 
   ARRAY['Up to 100 bookings/month', 'Up to 3 staff members', 'Basic customer management', 'Online booking widget', 'Email support', 'Basic reporting'],
   '{"bookings": 100, "staff": 3, "locations": 1}',
   false),
  ('standard', 'Standard', 49.99, 499.99, 'Great for growing salons with more features', 
   ARRAY['Up to 500 bookings/month', 'Up to 10 staff members', 'Advanced customer management', 'Online booking & scheduling', 'Email & chat support', 'Advanced reporting', 'SMS notifications', 'Inventory management'],
   '{"bookings": 500, "staff": 10, "locations": 1}',
   true),
  ('premium', 'Premium', 99.99, 999.99, 'Complete solution for established salons', 
   ARRAY['Unlimited bookings', 'Unlimited staff members', 'Multi-location support', 'Advanced analytics', 'Priority support', 'Custom branding', 'Marketing tools', 'API access', 'Staff management', 'Inventory tracking', 'Financial reporting'],
   '{"bookings": "unlimited", "staff": "unlimited", "locations": "unlimited"}',
   false);