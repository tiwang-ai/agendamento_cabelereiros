/*
  # Add Service Status Table

  1. New Tables
    - `service_status`
      - `id` (uuid, primary key)
      - `name` (text)
      - `status` (text)
      - `last_checked` (timestamptz)
      - `uptime` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `service_status` table
    - Add policies for authenticated users
*/

-- Create service_status table
CREATE TABLE service_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('operational', 'degraded', 'down')),
  last_checked timestamptz DEFAULT now(),
  uptime numeric DEFAULT 100.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view service status"
  ON service_status
  FOR SELECT
  USING (true);

CREATE POLICY "Admin users can manage service status"
  ON service_status
  FOR ALL
  USING (
    current_user = 'lucas@tiwang.com.br'
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_user
      AND role = 'super_admin'
    )
  );

-- Insert initial services
INSERT INTO service_status (name, status, uptime) VALUES
  ('API', 'operational', 99.99),
  ('Database', 'operational', 99.95),
  ('Authentication', 'operational', 99.99),
  ('Storage', 'operational', 99.90),
  ('WebSocket', 'operational', 99.95);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_service_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_service_status_timestamp
  BEFORE UPDATE ON service_status
  FOR EACH ROW
  EXECUTE FUNCTION update_service_status_updated_at();