/*
  # Estrutura Administrativa

  1. Novas Tabelas
    - `admin_users` - Usuários administrativos
    - `subscription_plans` - Planos de assinatura
    - `subscriptions` - Assinaturas dos estabelecimentos
    - `support_tickets` - Tickets de suporte
    - `staff_members` - Membros da equipe administrativa

  2. Segurança
    - Políticas RLS para acesso administrativo
*/

-- Criar enum para status de ticket
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Criar enum para níveis de acesso administrativo
CREATE TYPE admin_role AS ENUM ('super_admin', 'support', 'financial', 'technical');

-- Tabela de usuários administrativos
CREATE TABLE admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  encrypted_password text NOT NULL,
  role admin_role NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_sign_in_at timestamptz
);

-- Tabela de planos
CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  features jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de assinaturas
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons NOT NULL,
  plan_id uuid REFERENCES subscription_plans NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  canceled_at timestamptz,
  CONSTRAINT valid_subscription_status CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid'))
);

-- Tabela de tickets de suporte
CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons,
  title text NOT NULL,
  description text NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES admin_users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Tabela de membros da equipe
CREATE TABLE staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admin_users NOT NULL,
  name text NOT NULL,
  position text NOT NULL,
  department text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Inserir usuário administrativo inicial
INSERT INTO admin_users (email, encrypted_password, role)
VALUES (
  'lucas@tiwang.com.br',
  crypt('admin123', gen_salt('bf')),
  'super_admin'
);

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_users
CREATE POLICY "Admin users can view all admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = auth.uid()
  ));

-- Políticas para subscription_plans
CREATE POLICY "Admin users can manage subscription plans"
  ON subscription_plans
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = auth.uid()
  ));

-- Políticas para subscriptions
CREATE POLICY "Admin users can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = auth.uid()
  ));

-- Políticas para support_tickets
CREATE POLICY "Admin users can manage support tickets"
  ON support_tickets
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = auth.uid()
  ));

-- Políticas para staff_members
CREATE POLICY "Admin users can manage staff members"
  ON staff_members
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.id = auth.uid()
  ));