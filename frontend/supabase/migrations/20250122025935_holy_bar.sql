/*
  # Fix admin policies and prevent recursion

  1. Changes
    - Drop existing admin_users policies
    - Create new non-recursive policies
    - Fix policy conditions to prevent infinite recursion
  
  2. Security
    - Maintain proper access control
    - Ensure super admin access
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can view own record" ON admin_users;
DROP POLICY IF EXISTS "Super admin can manage all" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view all records" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all records" ON admin_users;

-- Create new non-recursive policies
CREATE POLICY "Admin users can view records"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    email = current_user
    OR current_user = 'lucas@tiwang.com.br'
  );

CREATE POLICY "Super admin can manage all"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    current_user = 'lucas@tiwang.com.br'
    OR role = 'super_admin'
  );

-- Update salon_users policies
DROP POLICY IF EXISTS "Admin users can manage salon users" ON salon_users;
DROP POLICY IF EXISTS "Salon owners can manage their users" ON salon_users;

CREATE POLICY "Admin users can manage salon users"
  ON salon_users
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

CREATE POLICY "Salon owners can manage their users"
  ON salon_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM salons
      WHERE id = salon_users.salon_id
      AND owner_id = auth.uid()
    )
  );