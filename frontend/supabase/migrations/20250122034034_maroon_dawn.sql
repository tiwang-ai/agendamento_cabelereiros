-- Drop existing policies
DROP POLICY IF EXISTS "View subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Manage subscription plans" ON subscription_plans;

-- Create new simplified policies
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans
  FOR SELECT
  USING (true);

CREATE POLICY "Super admin can manage subscription plans"
  ON subscription_plans
  FOR ALL
  USING (
    current_user = 'lucas@tiwang.com.br'
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_user
      AND role = 'super_admin'
    )
  );

-- Update related policies for consistency
DROP POLICY IF EXISTS "View subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Manage subscriptions" ON subscriptions;

CREATE POLICY "Anyone can view subscriptions"
  ON subscriptions
  FOR SELECT
  USING (true);

CREATE POLICY "Super admin can manage subscriptions"
  ON subscriptions
  FOR ALL
  USING (
    current_user = 'lucas@tiwang.com.br'
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_user
      AND role = 'super_admin'
    )
  );