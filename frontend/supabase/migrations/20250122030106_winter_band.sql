/*
  # Fix salon users creation and policies

  1. Changes
    - Add temp_password column to salon_users
    - Create function to handle user creation
    - Update policies to prevent recursion
    - Add proper error handling
  
  2. Security
    - Maintain proper access control
    - Handle user creation securely
*/

-- Add temp_password column if it doesn't exist
ALTER TABLE salon_users
ADD COLUMN IF NOT EXISTS temp_password text,
ADD COLUMN IF NOT EXISTS password_changed boolean DEFAULT false;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_salon_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default values
  NEW.temp_password := COALESCE(NEW.temp_password, 'changeme123');
  NEW.password_changed := FALSE;
  
  -- Create auth user if email doesn't exist
  BEGIN
    INSERT INTO auth.users (
      email,
      raw_app_meta_data,
      raw_user_meta_data,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      NEW.email,
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'name', NEW.name,
        'salon_id', NEW.salon_id,
        'role', NEW.role
      ),
      crypt(NEW.temp_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO NEW.user_id;
  EXCEPTION 
    WHEN unique_violation THEN
      -- If user already exists, get their ID
      SELECT id INTO NEW.user_id
      FROM auth.users
      WHERE email = NEW.email;
  END;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error creating user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_salon_user_creation ON salon_users;

-- Create new trigger
CREATE TRIGGER handle_salon_user_creation
  BEFORE INSERT ON salon_users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_salon_user();

-- Update policies to prevent recursion
DROP POLICY IF EXISTS "Admin users can manage salon users" ON salon_users;
DROP POLICY IF EXISTS "Salon owners can manage their users" ON salon_users;

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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON auth.users TO postgres;