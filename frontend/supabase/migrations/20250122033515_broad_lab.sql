-- Drop existing policies
DROP POLICY IF EXISTS "View admin records" ON admin_users;
DROP POLICY IF EXISTS "Manage admin records" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view records" ON admin_users;
DROP POLICY IF EXISTS "Super admin can manage all" ON admin_users;

-- Create new simplified policies without recursion
CREATE POLICY "View admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    email = 'lucas@tiwang.com.br'
    OR role = 'super_admin'
  );

-- Update subscription_plans policies
DROP POLICY IF EXISTS "View subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Manage subscription plans" ON subscription_plans;

CREATE POLICY "View subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage subscription plans"
  ON subscription_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.email()
      AND (role = 'super_admin' OR role = 'financial')
    )
  );

-- Update subscriptions policies
DROP POLICY IF EXISTS "Manage subscriptions" ON subscriptions;

CREATE POLICY "View subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Manage subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.email()
      AND (role = 'super_admin' OR role = 'financial')
    )
  );