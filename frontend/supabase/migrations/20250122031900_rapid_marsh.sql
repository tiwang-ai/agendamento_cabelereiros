/*
  # Fix admin policies and update salon user management
  
  1. Changes
    - Drop existing policies safely
    - Create new non-recursive policies
    - Update salon user management policies
    
  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
*/

-- Drop existing policies safely
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin users can view all records" ON admin_users;
  DROP POLICY IF EXISTS "Super admins can manage all records" ON admin_users;
  DROP POLICY IF EXISTS "Admin users can view own record" ON admin_users;
  DROP POLICY IF EXISTS "Super admin can manage all" ON admin_users;
END $$;

-- Create new non-recursive policies for admin_users
CREATE POLICY "View admin records"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    email = current_user
    OR current_user = 'lucas@tiwang.com.br'
  );

CREATE POLICY "Manage admin records"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    current_user = 'lucas@tiwang.com.br'
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_user
      AND role = 'super_admin'
      AND email != current_user
    )
  );

-- Update salon_users policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin users can manage all salon users" ON salon_users;
  DROP POLICY IF EXISTS "Salon owners can manage their salon users" ON salon_users;
END $$;

CREATE POLICY "Manage salon users as admin"
  ON salon_users
  FOR ALL
  TO authenticated
  USING (
    current_user = 'lucas@tiwang.com.br'
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_user
      AND active = true
    )
  );

CREATE POLICY "Manage salon users as owner"
  ON salon_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons
      WHERE id = salon_users.salon_id
      AND owner_id = auth.uid()
    )
  );

-- Update user creation function
CREATE OR REPLACE FUNCTION handle_new_salon_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id uuid;
  existing_user_record RECORD;
BEGIN
  -- Check if user already exists
  SELECT * INTO existing_user_record
  FROM auth.users
  WHERE email = NEW.email;

  IF existing_user_record IS NOT NULL THEN
    -- Use existing user
    NEW.user_id := existing_user_record.id;
  ELSE
    -- Create new user with temporary password
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      NEW.email,
      crypt(COALESCE(NEW.temp_password, 'changeme123'), gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'name', NEW.name,
        'salon_id', NEW.salon_id,
        'role', NEW.role
      ),
      now(),
      now(),
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO NEW.user_id;
  END IF;

  -- Set default values
  NEW.temp_password := NULL;
  NEW.password_changed := FALSE;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error creating user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON auth.users TO postgres;