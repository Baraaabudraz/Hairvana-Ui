/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text)
      - `role` (text)
      - `status` (text)
      - `join_date` (timestamptz)
      - `last_login` (timestamptz)
      - `avatar` (text)
      - `permissions` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'salon', 'user')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  join_date timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz,
  avatar text,
  permissions text[],
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- For salon owners, we need additional fields
CREATE TABLE IF NOT EXISTS salon_owners (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_salons integer DEFAULT 0,
  total_revenue numeric(10,2) DEFAULT 0,
  total_bookings integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- For regular users (customers), we need additional fields
CREATE TABLE IF NOT EXISTS customers (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_spent numeric(10,2) DEFAULT 0,
  total_bookings integer DEFAULT 0,
  favorite_services text[],
  suspension_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_salon_owners_updated_at
  BEFORE UPDATE ON salon_owners
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();