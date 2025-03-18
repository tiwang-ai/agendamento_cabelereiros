/*
  # Fix salon users creation and policies

  1. Changes
    - Simplify user creation process
    - Fix policy recursion issues
    - Add proper error handling
    - Ensure proper permissions
  
  2. Security
    - Maintain proper access control
    - Handle user creation securely
*/

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Admin users can manage salon users" ON salon_users;
DROP POLICY IF EXISTS "Salon owners can manage their users" ON salon_users;
DROP POLICY IF EXISTS "Users can view their own salon user record" ON salon_users;

-- Update salon_users table
ALTER TABLE salon_users
ADD COLUMN IF NOT EXISTS temp_password text,
ADD COLUMN IF NOT EXISTS password_changed boolean DEFAULT false;

-- Create new simplified function for user creation
CREATE OR REPLACE FUNCTION handle_new_salon_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO existing_user_id
  FROM auth.users
  WHERE email = NEW.email;

  IF existing_user_id IS NOT NULL THEN
    -- Use existing user
    NEW.user_id := existing_user_id;
  ELSE
    -- Create new user
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      role,
      aud,
      created_at,
      updated_at
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
      'authenticated',
      'authenticated',
      now(),
      now()
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

-- Recreate trigger
DROP TRIGGER IF EXISTS handle_salon_user_creation ON salon_users;

CREATE TRIGGER handle_salon_user_creation
  BEFORE INSERT ON salon_users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_salon_user();

-- Create new simplified policies
CREATE POLICY "Admin users can manage salon users"
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

CREATE POLICY "Salon owners can manage their users"
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

CREATE POLICY "Users can view their own salon user record"
  ON salon_users
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR email = current_user
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON auth.users TO postgres;