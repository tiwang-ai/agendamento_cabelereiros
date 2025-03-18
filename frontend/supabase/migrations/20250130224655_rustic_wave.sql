-- Add new super admin user
INSERT INTO admin_users (
  email,
  encrypted_password,
  role,
  active,
  created_at,
  last_sign_in_at
) 
SELECT 
  'projetos@orilab.io',
  crypt('123456', gen_salt('bf')),
  'super_admin',
  true,
  now(),
  null
WHERE NOT EXISTS (
  SELECT 1 FROM admin_users WHERE email = 'projetos@orilab.io'
);

-- Ensure the user has the correct role and is active
UPDATE admin_users
SET 
  role = 'super_admin',
  active = true,
  encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'projetos@orilab.io';