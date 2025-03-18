/*
  # Add subscription details and plan status

  1. Changes
    - Add subscription status tracking
    - Add payment tracking
    - Add trial period handling
    - Add subscription history
  
  2. Security
    - Maintain proper access control
    - Track subscription changes
*/

-- Add additional fields to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS trial_end timestamptz,
ADD COLUMN IF NOT EXISTS next_billing_date timestamptz,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_payment_date timestamptz,
ADD COLUMN IF NOT EXISTS payment_method jsonb;

-- Create subscription history table
CREATE TABLE subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons NOT NULL,
  subscription_id uuid REFERENCES subscriptions NOT NULL,
  plan_id uuid REFERENCES subscription_plans NOT NULL,
  change_type text NOT NULL,
  previous_status text,
  new_status text,
  changed_at timestamptz DEFAULT now(),
  changed_by uuid REFERENCES admin_users,
  details jsonb
);

-- Enable RLS
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_history
CREATE POLICY "Admin users can view subscription history"
  ON subscription_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_user
      AND active = true
    )
  );

-- Add audit trigger for subscription history
CREATE TRIGGER audit_subscription_history_changes
  AFTER INSERT OR UPDATE OR DELETE ON subscription_history
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Function to record subscription changes
CREATE OR REPLACE FUNCTION record_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO subscription_history (
      salon_id,
      subscription_id,
      plan_id,
      change_type,
      previous_status,
      new_status,
      changed_by,
      details
    ) VALUES (
      NEW.salon_id,
      NEW.id,
      NEW.plan_id,
      CASE
        WHEN OLD.status != NEW.status THEN 'status_change'
        WHEN OLD.plan_id != NEW.plan_id THEN 'plan_change'
        ELSE 'other'
      END,
      OLD.status,
      NEW.status,
      auth.uid(),
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
    );
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscription changes
CREATE TRIGGER record_subscription_changes
  AFTER UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION record_subscription_change();