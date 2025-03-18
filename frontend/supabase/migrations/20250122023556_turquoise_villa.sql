/*
  # Implementação de Usuários do Estabelecimento
  
  1. Novas Tabelas
    - salon_users: Usuários do estabelecimento
    - salon_roles: Papéis/permissões dos usuários
  
  2. Segurança
    - RLS policies para controle de acesso
    - Restrições de integridade
*/

-- Criar enum para papéis dos usuários do estabelecimento
CREATE TYPE salon_user_role AS ENUM ('admin', 'owner', 'professional', 'receptionist');

-- Criar tabela de usuários do estabelecimento
CREATE TABLE salon_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role salon_user_role NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, user_id),
  UNIQUE(salon_id, email)
);

-- Habilitar RLS
ALTER TABLE salon_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admin users can manage all salon users"
  ON salon_users
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

CREATE POLICY "Salon owners can manage their salon users"
  ON salon_users
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM salons
    WHERE salons.id = salon_users.salon_id
    AND salons.owner_id = auth.uid()
  ));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_salon_users_updated_at
  BEFORE UPDATE ON salon_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para auditoria
CREATE TRIGGER audit_salon_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON salon_users
  FOR EACH ROW EXECUTE FUNCTION log_audit();