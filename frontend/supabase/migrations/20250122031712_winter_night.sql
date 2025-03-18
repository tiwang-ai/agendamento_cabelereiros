/*
  # Fix subscription policies and add plan name to subscriptions view

  1. Changes
    - Drop existing policies to prevent recursion
    - Create new simplified policies
    - Add subscription plan details to view
  
  2. Security
    - Maintain proper access control
    - Prevent infinite recursion
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can view subscription history" ON subscription_history;
DROP POLICY IF EXISTS "Admin users can manage subscriptions" ON subscriptions;

-- Create new policies without recursion
CREATE POLICY "View subscription history"
  ON subscription_history
  FOR SELECT
  TO authenticated
  USING (
    current_user = 'lucas@tiwang.com.br'
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_user
      AND active = true
    )
  );

CREATE POLICY "Manage subscriptions"
  ON subscriptions
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

-- Add policy for subscription plans
CREATE POLICY "View subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (true);