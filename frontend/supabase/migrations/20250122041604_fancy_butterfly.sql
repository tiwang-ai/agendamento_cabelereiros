-- Drop existing policies
DROP POLICY IF EXISTS "salon_select_policy" ON salons;
DROP POLICY IF EXISTS "salon_insert_policy" ON salons;
DROP POLICY IF EXISTS "salon_update_policy" ON salons;

-- Create new policies for salons
CREATE POLICY "salons_select_policy"
  ON salons
  FOR SELECT
  USING (true);

CREATE POLICY "salons_insert_policy"
  ON salons
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "salons_update_policy"
  ON salons
  FOR UPDATE
  USING (true);

CREATE POLICY "salons_delete_policy"
  ON salons
  FOR DELETE
  USING (true);

-- Add index to improve performance
CREATE INDEX IF NOT EXISTS idx_salons_owner_id ON salons(owner_id);

-- Grant necessary permissions
GRANT ALL ON salons TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add view for salon details
CREATE OR REPLACE VIEW salon_details AS
SELECT 
  s.*,
  u.email as owner_email,
  sp.name as plan_name,
  sub.status as subscription_status
FROM salons s
LEFT JOIN auth.users u ON s.owner_id = u.id
LEFT JOIN subscriptions sub ON s.id = sub.salon_id AND sub.status = 'active'
LEFT JOIN subscription_plans sp ON sub.plan_id = sp.id;

-- Grant access to the view
GRANT SELECT ON salon_details TO authenticated;