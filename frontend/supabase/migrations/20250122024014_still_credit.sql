/*
  # Correção dos triggers de auditoria

  1. Alterações
    - Remove triggers existentes
    - Atualiza a função de auditoria para melhor tratamento de salon_id
    - Recria os triggers com a nova função
    - Ajusta permissões necessárias

  2. Segurança
    - Mantém RLS ativo
    - Preserva dados existentes
    - Não afeta registros de auditoria anteriores
*/

-- Remover triggers existentes de forma segura
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_salon_users_changes') THEN
    DROP TRIGGER audit_salon_users_changes ON salon_users;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_salons_changes') THEN
    DROP TRIGGER audit_salons_changes ON salons;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_subscriptions_changes') THEN
    DROP TRIGGER audit_subscriptions_changes ON subscriptions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_subscription_plans_changes') THEN
    DROP TRIGGER audit_subscription_plans_changes ON subscription_plans;
  END IF;
END $$;

-- Atualizar a função de auditoria para ser mais flexível
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
DECLARE
  salon_id_value uuid;
BEGIN
  -- Determinar o salon_id baseado na tabela e operação
  salon_id_value := CASE
    WHEN TG_TABLE_NAME = 'salons' THEN 
      CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id
        ELSE NEW.id
      END
    WHEN TG_TABLE_NAME IN ('subscriptions', 'salon_users', 'salon_settings') THEN
      CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.salon_id
        ELSE NEW.salon_id
      END
    ELSE NULL
  END;

  INSERT INTO audit_logs (
    salon_id,
    admin_user_id,
    action,
    table_name,
    record_id,
    changes
  ) VALUES (
    salon_id_value,
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
$$ language 'plpgsql' SECURITY DEFINER;

-- Recriar os triggers com a nova função
CREATE TRIGGER audit_salons_changes
  AFTER INSERT OR UPDATE OR DELETE ON salons
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_subscriptions_changes
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_subscription_plans_changes
  AFTER INSERT OR UPDATE OR DELETE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION log_audit();

CREATE TRIGGER audit_salon_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON salon_users
  FOR EACH ROW EXECUTE FUNCTION log_audit();

-- Garantir que a função tem permissão para acessar auth.uid()
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT EXECUTE ON FUNCTION auth.uid() TO postgres;