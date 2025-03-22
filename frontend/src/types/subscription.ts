/**
 * Tipos relacionados a planos e assinaturas
 */

/**
 * Status possíveis de uma assinatura
 */
export enum SubscriptionStatus {
  /** Assinatura ativa e em dia */
  ACTIVE = 'active',
  
  /** Assinatura cancelada */
  CANCELLED = 'cancelled',
  
  /** Assinatura suspensa por falta de pagamento */
  SUSPENDED = 'suspended',
  
  /** Assinatura em período de teste */
  TRIAL = 'trial',
  
  /** Assinatura expirada */
  EXPIRED = 'expired'
}

/**
 * Status possíveis de pagamento
 */
export enum PaymentStatus {
  /** Pagamento aprovado */
  APPROVED = 'approved',
  
  /** Pagamento pendente */
  PENDING = 'pending',
  
  /** Pagamento recusado */
  DECLINED = 'declined',
  
  /** Pagamento reembolsado */
  REFUNDED = 'refunded',
  
  /** Pagamento cancelado */
  CANCELLED = 'cancelled'
}

/**
 * Tipos de alteração no histórico
 */
export enum ChangeType {
  /** Alteração de status */
  STATUS_CHANGE = 'status_change',
  
  /** Alteração de plano */
  PLAN_CHANGE = 'plan_change',
  
  /** Alteração de pagamento */
  PAYMENT_CHANGE = 'payment_change',
  
  /** Outras alterações */
  OTHER = 'other'
}

/**
 * Representa um plano de assinatura no sistema
 */
export interface SubscriptionPlan {
  /** Identificador único do plano */
  id: string;

  /** Nome do plano */
  name: string;

  /** Descrição detalhada do plano */
  description: string | null;

  /** Preço mensal do plano em reais */
  price: number;

  /** Mapa de recursos disponíveis no plano */
  features: Record<string, boolean>;

  /** Mapa de limites numéricos do plano */
  limits: Record<string, number>;

  /** Indica se o plano está ativo para novas assinaturas */
  active: boolean;
}

/**
 * Representa uma assinatura de plano
 */
export interface Subscription {
  /** Identificador único da assinatura */
  id: string;

  /** ID do plano assinado */
  plan_id: string;

  /** ID do salão assinante */
  salon_id: string;

  /** Status atual da assinatura */
  status: SubscriptionStatus;

  /** Data de início do período atual */
  current_period_start: string;

  /** Data de término do período atual */
  current_period_end: string;

  /** Data de término do período de teste (se houver) */
  trial_end: string | null;

  /** Data do próximo pagamento */
  next_billing_date: string | null;

  /** Status do último pagamento */
  payment_status: PaymentStatus;

  /** Data do último pagamento */
  last_payment_date: string | null;
}

/**
 * Representa uma entrada no histórico de alterações
 */
export interface SubscriptionHistory {
  /** Identificador único do registro */
  id: string;

  /** Tipo de alteração */
  change_type: ChangeType;

  /** Status anterior (em caso de alteração de status) */
  previous_status: string | null;

  /** Novo status (em caso de alteração de status) */
  new_status: string | null;

  /** Data da alteração */
  changed_at: string;

  /** Detalhes adicionais da alteração */
  details: Record<string, any>;
}

/**
 * Props do componente SubscriptionPlanForm
 */
export interface SubscriptionPlanFormProps {
  /** Plano existente para edição (opcional) */
  plan?: SubscriptionPlan | null;

  /** Callback chamado ao fechar o formulário */
  onClose: () => void;

  /** Callback chamado após salvar com sucesso */
  onSuccess: () => void;
}

/**
 * Props do componente SubscriptionDetails
 */
export interface SubscriptionDetailsProps {
  /** ID do salão para exibir os detalhes da assinatura */
  salonId: string;

  /** Callback chamado ao fechar o componente */
  onClose: () => void;
}

/**
 * Dados do formulário de plano de assinatura
 */
export interface SubscriptionPlanFormData {
  /** Nome do plano */
  name: string;

  /** Descrição do plano */
  description: string;

  /** Preço mensal em reais */
  price: number;

  /** Recursos disponíveis */
  features: Record<string, boolean>;

  /** Limites numéricos */
  limits: Record<string, number>;
} 