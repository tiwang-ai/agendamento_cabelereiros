-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Super admin can manage subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Anyone can view subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Super admin can manage subscriptions" ON subscriptions;

-- Create simplified policies for subscription plans
CREATE POLICY "View subscription plans"
  ON subscription_plans
  FOR SELECT
  USING (true);

CREATE POLICY "Manage subscription plans"
  ON subscription_plans
  FOR ALL
  USING (true);

-- Create simplified policies for subscriptions
CREATE POLICY "View subscriptions"
  ON subscriptions
  FOR SELECT
  USING (true);

CREATE POLICY "Manage subscriptions"
  ON subscriptions
  FOR ALL
  USING (true);