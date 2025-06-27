/*
  # Create mobile API specific tables

  1. New Tables
    - `mobile_devices`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `device_token` (text)
      - `device_type` (text)
      - `last_login` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `appointments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `salon_id` (uuid, foreign key)
      - `service_id` (uuid, foreign key)
      - `staff_id` (uuid, foreign key)
      - `date` (timestamptz)
      - `duration` (integer)
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `services`
      - `id` (uuid, primary key)
      - `salon_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `duration` (integer)
      - `category` (text)
      - `image` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `staff`
      - `id` (uuid, primary key)
      - `salon_id` (uuid, foreign key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `role` (text)
      - `bio` (text)
      - `avatar` (text)
      - `services` (uuid[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Mobile Devices Table
CREATE TABLE IF NOT EXISTS mobile_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_token text NOT NULL,
  device_type text NOT NULL CHECK (device_type IN ('ios', 'android')),
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  duration integer NOT NULL, -- in minutes
  category text,
  image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  role text,
  bio text,
  avatar text,
  services uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date timestamptz NOT NULL,
  duration integer NOT NULL, -- in minutes
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE mobile_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for mobile_devices
CREATE POLICY "Users can manage their own devices"
  ON mobile_devices
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all devices"
  ON mobile_devices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Create policies for services
CREATE POLICY "Anyone can read services"
  ON services
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Salon owners can manage their salon's services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons
      WHERE salons.id = salon_id AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Create policies for staff
CREATE POLICY "Anyone can read staff"
  ON staff
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Salon owners can manage their salon's staff"
  ON staff
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons
      WHERE salons.id = salon_id AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all staff"
  ON staff
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Create policies for appointments
CREATE POLICY "Users can read their own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Salon owners can read their salon's appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons
      WHERE salons.id = salon_id AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Salon owners can update their salon's appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons
      WHERE salons.id = salon_id AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_mobile_devices_updated_at
  BEFORE UPDATE ON mobile_devices
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create trigger to update customer stats when an appointment is created or updated
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
DECLARE
  service_price numeric;
BEGIN
  -- Get the service price
  SELECT price INTO service_price FROM services WHERE id = NEW.service_id;
  
  -- Update customers table with new stats
  IF TG_OP = 'INSERT' AND NEW.status != 'cancelled' THEN
    UPDATE customers
    SET 
      total_bookings = total_bookings + 1,
      total_spent = total_spent + COALESCE(service_price, 0),
      updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed from non-cancelled to cancelled
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
      UPDATE customers
      SET 
        total_bookings = total_bookings - 1,
        total_spent = total_spent - COALESCE(service_price, 0),
        updated_at = now()
      WHERE user_id = NEW.user_id;
    -- If status changed from cancelled to non-cancelled
    ELSIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
      UPDATE customers
      SET 
        total_bookings = total_bookings + 1,
        total_spent = total_spent + COALESCE(service_price, 0),
        updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_stats_trigger
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_customer_stats();

-- Create trigger to update salon stats when an appointment is created or updated
CREATE OR REPLACE FUNCTION update_salon_appointment_stats()
RETURNS TRIGGER AS $$
DECLARE
  service_price numeric;
BEGIN
  -- Get the service price
  SELECT price INTO service_price FROM services WHERE id = NEW.service_id;
  
  -- Update salons table with new stats
  IF TG_OP = 'INSERT' AND NEW.status != 'cancelled' THEN
    UPDATE salons
    SET 
      bookings = bookings + 1,
      revenue = revenue + COALESCE(service_price, 0),
      updated_at = now()
    WHERE id = NEW.salon_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed from non-cancelled to cancelled
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
      UPDATE salons
      SET 
        bookings = bookings - 1,
        revenue = revenue - COALESCE(service_price, 0),
        updated_at = now()
      WHERE id = NEW.salon_id;
    -- If status changed from cancelled to non-cancelled
    ELSIF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
      UPDATE salons
      SET 
        bookings = bookings + 1,
        revenue = revenue + COALESCE(service_price, 0),
        updated_at = now()
      WHERE id = NEW.salon_id;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER salon_appointment_stats_trigger
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_salon_appointment_stats();