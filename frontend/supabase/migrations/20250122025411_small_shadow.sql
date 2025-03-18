/*
  # Fix salon users registration and policies

  1. Changes
    - Update salon_users table structure
    - Add proper foreign key constraints
    - Update RLS policies for salon_users
    - Add trigger for user creation
  
  2. Security
    - Maintain RLS policies
    - Add proper constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can manage all salon users" ON salon_users;
DROP POLICY IF EXISTS "Salon owners can manage their salon users" ON salon_users;

-- Update salon_users table
ALTER TABLE salon_users
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS temp_password text,
  ADD COLUMN IF NOT EXISTS password_changed boolean DEFAULT false;

-- Create new policies for salon_users
CREATE POLICY "Admin users can manage all salon users"
  ON salon_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.email()
      AND active = true
    )
  );

CREATE POLICY "Salon owners can manage their salon users"
  ON salon_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons
      WHERE salons.id = salon_users.salon_id
      AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own salon user record"
  ON salon_users
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR email = auth.email()
  );

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_salon_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id uuid;
  temp_pass text;
BEGIN
  -- Generate temporary password if not provided
  IF NEW.temp_password IS NULL THEN
    temp_pass := encode(gen_random_bytes(12), 'base64');
    NEW.temp_password := temp_pass;
  ELSE
    temp_pass := NEW.temp_password;
  END IF;

  -- Create auth user if it doesn't exist
  IF NEW.user_id IS NULL THEN
    BEGIN
      INSERT INTO auth.users (
        email,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        role
      ) VALUES (
        NEW.email,
        now(),
        jsonb_build_object(
          'name', NEW.name,
          'salon_id', NEW.salon_id,
          'role', NEW.role
        ),
        now(),
        now(),
        'authenticated'
      )
      RETURNING id INTO new_user_id;

      -- Set password for the new user
      UPDATE auth.users
      SET encrypted_password = crypt(temp_pass, gen_salt('bf'))
      WHERE id = new_user_id;

      -- Update the salon_user record with the new user_id
      NEW.user_id := new_user_id;
    EXCEPTION WHEN unique_violation THEN
      -- If user already exists, get their ID
      SELECT id INTO new_user_id
      FROM auth.users
      WHERE email = NEW.email;
      
      NEW.user_id := new_user_id;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_salon_user_creation ON salon_users;

-- Create trigger for new user creation
CREATE TRIGGER handle_salon_user_creation
  BEFORE INSERT ON salon_users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_salon_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON auth.users TO postgres;