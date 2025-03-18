-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create enum for admin roles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
    CREATE TYPE admin_role AS ENUM ('super_admin', 'support', 'financial', 'technical');
  END IF;
END $$;

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  role admin_role NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_sign_in_at timestamptz
);

-- Insert initial admin user if it doesn't exist
INSERT INTO admin_users (email, encrypted_password, role)
SELECT 'lucas@tiwang.com.br', crypt('admin123', gen_salt('bf')), 'super_admin'
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE email = 'lucas@tiwang.com.br'
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'admin_users'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin users can view their own data" ON admin_users;
  DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
END $$;

CREATE POLICY "Admin users can view their own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (email = current_user);

CREATE POLICY "Super admins can manage all admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_user
      AND role = 'super_admin'
    )
  );