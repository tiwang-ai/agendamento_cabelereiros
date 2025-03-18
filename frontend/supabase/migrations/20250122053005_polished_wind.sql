-- Drop existing function and trigger
DROP TRIGGER IF EXISTS handle_salon_user_creation ON salon_users;
DROP FUNCTION IF EXISTS handle_new_salon_user();

-- Create improved function for user creation
CREATE OR REPLACE FUNCTION handle_new_salon_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_id uuid;
  default_password text := 'changeme123';
BEGIN
  -- Create auth user if email doesn't exist
  BEGIN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      NEW.email,
      crypt(COALESCE(NEW.temp_password, default_password), gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object(
        'name', NEW.name,
        'salon_id', NEW.salon_id,
        'role', NEW.role
      ),
      now(),
      now()
    )
    RETURNING id INTO new_user_id;

    -- Update the salon_user record with the new user_id
    NEW.user_id := new_user_id;
    NEW.temp_password := default_password;
    NEW.password_changed := false;

  EXCEPTION 
    WHEN unique_violation THEN
      -- If user already exists, get their ID
      SELECT id INTO new_user_id
      FROM auth.users
      WHERE email = NEW.email;
      
      IF new_user_id IS NOT NULL THEN
        NEW.user_id := new_user_id;
        NEW.temp_password := NULL;
        NEW.password_changed := true;
      ELSE
        RAISE EXCEPTION 'Could not create or find user with email %', NEW.email;
      END IF;
  END;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error creating user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER handle_salon_user_creation
  BEFORE INSERT ON salon_users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_salon_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON auth.users TO postgres;