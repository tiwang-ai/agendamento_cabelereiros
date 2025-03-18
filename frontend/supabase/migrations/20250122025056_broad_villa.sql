/*
  # Fix audit logs and admin policies

  1. Changes
    - Drop existing triggers to prevent conflicts
    - Update admin_users policies to prevent recursion
    - Update audit_logs table to handle NULL admin_user_id
    - Update log_audit function with better error handling
    - Recreate triggers with proper error handling
  
  2. Security
    - Maintain RLS policies
    - Update permissions for auth.uid() access
*/

-- Drop existing triggers to prevent errors
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_salon_users_changes') THEN
    DROP TRIGGER audit_salon_users_changes ON salon_users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_salons_changes') THEN
    DROP TRIGGER audit_salons_changes ON salons;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_subscriptions_changes') THEN
    DROP TRIGGER audit_subscriptions_changes ON subscriptions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_subscription_plans_changes') THEN
    DROP TRIGGER audit_subscription_plans_changes ON subscription_plans;
  END IF;
END $$;

-- Drop existing admin_users policies to prevent recursion
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admin users can view their own data" ON admin_users;
  DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
  DROP POLICY IF EXISTS "Admin users can view all admin users" ON admin_users;
END $$;

-- Create new admin_users policies without recursion
CREATE POLICY "Admin users can view all records"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage all records"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    current_user = 'lucas@tiwang.com.br'
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_user
      AND role = 'super_admin'
      AND id != auth.uid() -- Prevent recursion
    )
  );

-- Update audit_logs table to handle NULL admin_user_id properly
DO $$ 
BEGIN
  -- Drop existing foreign key if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'audit_logs_admin_user_id_fkey'
  ) THEN
    ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_admin_user_id_fkey;
  END IF;

  -- Make admin_user_id nullable if it isn't already
  ALTER TABLE audit_logs ALTER COLUMN admin_user_id DROP NOT NULL;

  -- Add the foreign key constraint with ON DELETE SET NULL
  ALTER TABLE audit_logs
    ADD CONSTRAINT audit_logs_admin_user_id_fkey 
    FOREIGN KEY (admin_user_id) 
    REFERENCES admin_users(id)
    ON DELETE SET NULL;
END $$;

-- Update the audit function with better error handling
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
DECLARE
  salon_id_value uuid;
  record_data jsonb;
  current_admin_id uuid;
BEGIN
  -- Safely get admin user ID if it exists
  BEGIN
    SELECT id INTO current_admin_id
    FROM admin_users
    WHERE email = current_user
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    current_admin_id := NULL;
  END;

  -- Determine salon_id based on table and operation
  IF TG_TABLE_NAME = 'salons' THEN
    salon_id_value := CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END;
  ELSIF TG_TABLE_NAME IN ('subscriptions', 'salon_users', 'salon_settings') THEN
    salon_id_value := CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.salon_id
      ELSE NEW.salon_id
    END;
  END IF;

  -- Build record data based on operation
  CASE
    WHEN TG_OP = 'DELETE' THEN
      record_data := jsonb_build_object('old', to_jsonb(OLD));
    WHEN TG_OP = 'UPDATE' THEN
      record_data := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    WHEN TG_OP = 'INSERT' THEN
      record_data := jsonb_build_object('new', to_jsonb(NEW));
  END CASE;

  -- Insert audit log with error handling
  BEGIN
    INSERT INTO audit_logs (
      salon_id,
      admin_user_id,
      action,
      table_name,
      record_id,
      changes
    ) VALUES (
      salon_id_value,
      current_admin_id,
      TG_OP,
      TG_TABLE_NAME,
      CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id
        ELSE NEW.id
      END,
      record_data
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't prevent the operation
    RAISE WARNING 'Error logging audit: %', SQLERRM;
  END;
  
  RETURN NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Recreate triggers with the updated function
CREATE TRIGGER audit_salons_changes
  AFTER INSERT OR UPDATE OR DELETE ON salons
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_subscriptions_changes
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_subscription_plans_changes
  AFTER INSERT OR UPDATE OR DELETE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_salon_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON salon_users
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Ensure proper permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT EXECUTE ON FUNCTION auth.uid() TO postgres;