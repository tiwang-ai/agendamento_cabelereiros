-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own salon" ON salons;
DROP POLICY IF EXISTS "Users can insert their own salon" ON salons;

-- Create new simplified policies for salons
CREATE POLICY "salon_select_policy"
  ON salons
  FOR SELECT
  USING (true);

CREATE POLICY "salon_insert_policy"
  ON salons
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "salon_update_policy"
  ON salons
  FOR UPDATE
  USING (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON salons TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;