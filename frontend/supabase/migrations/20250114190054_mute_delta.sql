/*
  # Initial Schema Setup for Beauty Salon SAAS

  1. New Tables
    - `salons`
      - `id` (uuid, primary key)
      - `name` (text)
      - `owner_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `active` (boolean)
      
    - `professionals`
      - `id` (uuid, primary key)
      - `salon_id` (uuid, references salons)
      - `name` (text)
      - `email` (text)
      - `specialties` (text[])
      - `active` (boolean)
      
    - `services`
      - `id` (uuid, primary key)
      - `salon_id` (uuid, references salons)
      - `name` (text)
      - `duration` (integer, minutes)
      - `price` (decimal)
      - `active` (boolean)
      
    - `clients`
      - `id` (uuid, primary key)
      - `salon_id` (uuid, references salons)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      
    - `appointments`
      - `id` (uuid, primary key)
      - `salon_id` (uuid, references salons)
      - `client_id` (uuid, references clients)
      - `professional_id` (uuid, references professionals)
      - `service_id` (uuid, references services)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for salon access
    - Link users to salons
*/

-- Create salons table
CREATE TABLE salons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true,
  UNIQUE(owner_id)
);

-- Create professionals table
CREATE TABLE professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons NOT NULL,
  name text NOT NULL,
  email text,
  specialties text[],
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons NOT NULL,
  name text NOT NULL,
  duration integer NOT NULL,
  price decimal(10,2) NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons NOT NULL,
  client_id uuid REFERENCES clients NOT NULL,
  professional_id uuid REFERENCES professionals NOT NULL,
  service_id uuid REFERENCES services NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
);

-- Enable Row Level Security
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for salons
CREATE POLICY "Users can view their own salon"
  ON salons
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own salon"
  ON salons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Create policies for professionals
CREATE POLICY "Users can view their salon's professionals"
  ON professionals
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = professionals.salon_id
    AND salons.owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage their salon's professionals"
  ON professionals
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = professionals.salon_id
    AND salons.owner_id = auth.uid()
  ));

-- Create policies for services
CREATE POLICY "Users can view their salon's services"
  ON services
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = services.salon_id
    AND salons.owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage their salon's services"
  ON services
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = services.salon_id
    AND salons.owner_id = auth.uid()
  ));

-- Create policies for clients
CREATE POLICY "Users can view their salon's clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = clients.salon_id
    AND salons.owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage their salon's clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = clients.salon_id
    AND salons.owner_id = auth.uid()
  ));

-- Create policies for appointments
CREATE POLICY "Users can view their salon's appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = appointments.salon_id
    AND salons.owner_id = auth.uid()
  ));

CREATE POLICY "Users can manage their salon's appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = appointments.salon_id
    AND salons.owner_id = auth.uid()
  ));