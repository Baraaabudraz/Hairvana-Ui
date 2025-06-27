/*
  # Create salons table

  1. New Tables
    - `salons`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `location` (text)
      - `status` (text)
      - `join_date` (timestamptz)
      - `revenue` (numeric)
      - `bookings` (integer)
      - `rating` (numeric)
      - `services` (text[])
      - `owner_id` (uuid, foreign key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `salons` table
    - Add policies for salon owners and admins
*/

CREATE TABLE IF NOT EXISTS salons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  location text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
  join_date timestamptz NOT NULL DEFAULT now(),
  revenue numeric(10,2) DEFAULT 0,
  bookings integer DEFAULT 0,
  rating numeric(3,1) DEFAULT 0,
  services text[],
  hours jsonb,
  website text,
  description text,
  business_license text,
  tax_id text,
  images text[],
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_name text,
  owner_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Salon owners can read their own salons"
  ON salons
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Salon owners can update their own salons"
  ON salons
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Admins can read all salons"
  ON salons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

CREATE POLICY "Admins can update all salons"
  ON salons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

CREATE POLICY "Admins can insert salons"
  ON salons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_salons_updated_at
  BEFORE UPDATE ON salons
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create trigger to update salon_owners when a salon is created or updated
CREATE OR REPLACE FUNCTION update_salon_owner_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update salon_owners table with new stats
  IF TG_OP = 'INSERT' THEN
    UPDATE salon_owners
    SET 
      total_salons = total_salons + 1,
      total_revenue = total_revenue + COALESCE(NEW.revenue, 0),
      total_bookings = total_bookings + COALESCE(NEW.bookings, 0),
      updated_at = now()
    WHERE user_id = NEW.owner_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only update if revenue or bookings changed
    IF OLD.revenue != NEW.revenue OR OLD.bookings != NEW.bookings THEN
      UPDATE salon_owners
      SET 
        total_revenue = total_revenue - COALESCE(OLD.revenue, 0) + COALESCE(NEW.revenue, 0),
        total_bookings = total_bookings - COALESCE(OLD.bookings, 0) + COALESCE(NEW.bookings, 0),
        updated_at = now()
      WHERE user_id = NEW.owner_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE salon_owners
    SET 
      total_salons = total_salons - 1,
      total_revenue = total_revenue - COALESCE(OLD.revenue, 0),
      total_bookings = total_bookings - COALESCE(OLD.bookings, 0),
      updated_at = now()
    WHERE user_id = OLD.owner_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER salon_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON salons
FOR EACH ROW
EXECUTE FUNCTION update_salon_owner_stats();