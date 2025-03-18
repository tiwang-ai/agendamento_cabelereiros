-- Create admin user record
INSERT INTO admin_users (
  id,
  email,
  encrypted_password,
  role,
  active,
  created_at,
  last_sign_in_at
) 
VALUES (
  gen_random_uuid(),
  'projetos@orilab.io',
  crypt('123456', gen_salt('bf')),
  'super_admin',
  true,
  now(),
  null
)
ON CONFLICT (email) 
DO UPDATE SET
  role = 'super_admin',
  active = true,
  encrypted_password = crypt('123456', gen_salt('bf'));

-- Ensure RLS policies allow the new admin
DROP POLICY IF EXISTS "admin_access_policy" ON admin_users;

CREATE POLICY "admin_access_policy"
  ON admin_users
  FOR ALL
  USING (
    email = current_user 
    OR email = 'projetos@orilab.io'
    OR role = 'super_admin'
  );