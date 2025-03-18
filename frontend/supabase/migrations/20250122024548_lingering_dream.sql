-- Drop existing triggers to prevent errors during function update
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

-- Update audit_logs table to allow NULL admin_user_id
ALTER TABLE audit_logs 
  DROP CONSTRAINT IF EXISTS audit_logs_admin_user_id_fkey,
  ALTER COLUMN admin_user_id DROP NOT NULL,
  ADD CONSTRAINT audit_logs_admin_user_id_fkey 
    FOREIGN KEY (admin_user_id) 
    REFERENCES admin_users(id)
    ON DELETE SET NULL;

-- Update the audit function to handle cases where auth.uid() might not be an admin
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
DECLARE
  salon_id_value uuid;
  record_data jsonb;
  current_admin_id uuid;
BEGIN
  -- Try to get the admin user ID if it exists
  SELECT id INTO current_admin_id
  FROM admin_users
  WHERE id = auth.uid();

  -- Determine the salon_id based on table and operation
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

  -- Build the record data based on operation
  CASE
    WHEN TG_OP = 'DELETE' THEN
      record_data := jsonb_build_object('old', to_jsonb(OLD));
    WHEN TG_OP = 'UPDATE' THEN
      record_data := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    WHEN TG_OP = 'INSERT' THEN
      record_data := jsonb_build_object('new', to_jsonb(NEW));
  END CASE;

  -- Insert the audit log
  INSERT INTO audit_logs (
    salon_id,
    admin_user_id,
    action,
    table_name,
    record_id,
    changes
  ) VALUES (
    salon_id_value,
    current_admin_id, -- This will be NULL if the user is not an admin
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    record_data
  );
  
  RETURN NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Recreate the triggers with the updated function
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