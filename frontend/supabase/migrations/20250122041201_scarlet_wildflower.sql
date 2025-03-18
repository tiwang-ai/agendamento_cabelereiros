-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop subscription_plans policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'subscription_plans' 
    AND policyname = 'View subscription plans'
  ) THEN
    DROP POLICY "View subscription plans" ON subscription_plans;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'subscription_plans' 
    AND policyname = 'Manage subscription plans'
  ) THEN
    DROP POLICY "Manage subscription plans" ON subscription_plans;
  END IF;

  -- Drop subscriptions policies
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'subscriptions' 
    AND policyname = 'View subscriptions'
  ) THEN
    DROP POLICY "View subscriptions" ON subscriptions;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'subscriptions' 
    AND policyname = 'Manage subscriptions'
  ) THEN
    DROP POLICY "Manage subscriptions" ON subscriptions;
  END IF;
END $$;

-- Create new policies with safe names
CREATE POLICY "subscription_plans_view_policy"
  ON subscription_plans
  FOR SELECT
  USING (true);

CREATE POLICY "subscription_plans_manage_policy"
  ON subscription_plans
  FOR ALL
  USING (true);

CREATE POLICY "subscriptions_view_policy"
  ON subscriptions
  FOR SELECT
  USING (true);

CREATE POLICY "subscriptions_manage_policy"
  ON subscriptions
  FOR ALL
  USING (true);

-- Grant necessary permissions
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO postgres;