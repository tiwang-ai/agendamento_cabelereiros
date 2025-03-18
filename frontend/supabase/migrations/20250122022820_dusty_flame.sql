/*
  # Ajustes na estrutura administrativa do SAAS
  
  1. Melhorias
    - Adição de métricas de uso
    - Sistema de auditoria
    - Configurações por estabelecimento
    - Limites por plano
    - Webhooks para integrações
  
  2. Segurança
    - Políticas RLS atualizadas
    - Logs de auditoria
*/

-- Adicionar limites aos planos de assinatura
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS limits jsonb DEFAULT '{
  "max_professionals": 5,
  "max_services": 10,
  "max_clients": 100,
  "features": ["basic_scheduling", "client_management"]
}'::jsonb;

-- Criar tabela de métricas de uso
CREATE TABLE usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons NOT NULL,
  metric_name text NOT NULL,
  value integer NOT NULL,
  measured_at timestamptz DEFAULT now()
);

-- Criar tabela de logs de auditoria
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons,
  admin_user_id uuid REFERENCES admin_users,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de webhooks
CREATE TABLE webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de configurações por estabelecimento
CREATE TABLE salon_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid REFERENCES salons NOT NULL UNIQUE,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS para novas tabelas
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para usage_metrics
CREATE POLICY "Admin users can view all usage metrics"
  ON usage_metrics
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Políticas para audit_logs
CREATE POLICY "Admin users can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Políticas para webhooks
CREATE POLICY "Admin users can manage webhooks"
  ON webhooks
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Políticas para salon_settings
CREATE POLICY "Admin users can manage salon settings"
  ON salon_settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para salon_settings
CREATE TRIGGER update_salon_settings_updated_at
  BEFORE UPDATE ON salon_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para registrar auditoria
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    salon_id,
    admin_user_id,
    action,
    table_name,
    record_id,
    changes
  ) VALUES (
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.salon_id
      ELSE NEW.salon_id
    END,
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN jsonb_build_object('new', row_to_json(NEW))
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object('old', row_to_json(OLD))
    END
  );
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers de auditoria para tabelas principais
CREATE TRIGGER audit_salons_changes
  AFTER INSERT OR UPDATE OR DELETE ON salons
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_subscriptions_changes
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_subscription_plans_changes
  AFTER INSERT OR UPDATE OR DELETE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION log_audit();