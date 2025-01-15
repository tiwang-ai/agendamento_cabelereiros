// Tipagens compartilhadas para WhatsApp
export interface WhatsAppInstance {
  exists: boolean;
  state: 'disconnected' | 'connecting' | 'connected';
  qrCode?: string;
  pairingCode?: string;
  success?: boolean;
}

export interface WhatsAppStatus {
  state: 'disconnected' | 'connecting' | 'connected';
  message?: string;
}

export interface QRCodeResponse {
  pairingCode?: string;
  code: string;
  count: number;
  error?: string;
}

// Bot 1 (Suporte)
export interface StaffBotConfig {
    bot_ativo: boolean;
    prompt_template: string;
    attendance_mode: 'auto' | 'semi' | 'manual';
    evolution_settings: {
        reject_calls: boolean;
        read_messages: boolean;
        groups_ignore: boolean;
    };
    horario_atendimento: {
        inicio: string;
        fim: string;
    };
    webhook_settings: {
        enabled: boolean;
        url: string;
        events: string[];
    };
    support_whatsapp?: string;
    status?: string;
}

// Bot 2 (Salões)
export interface SalonBotConfig {
    bot_ativo: boolean;
    ignorar_grupos: boolean;
    tempo_debounce: number;
    horario_atendimento_inicio: string;
    horario_atendimento_fim: string;
    dias_atendimento: number[];
    mensagem_fora_horario: string;
    mensagem_bot_desativado: string;
    aceitar_nao_clientes?: boolean;
    mensagem_nao_cliente?: string;
    evolution_settings?: {
        reject_calls: boolean;
        read_messages: boolean;
        groups_ignore: boolean;
    };
    webhook_settings?: {
        enabled: boolean;
        url: string;
        events: string[];
    };
}

export interface BotMetrics {
    today_interactions: number;
    avg_response_time: string;
    resolution_rate: string;
    ai_interactions: number;
}

export interface ChatConfig {
  id: number;
  numero_cliente: string;
  bot_ativo: boolean;
  ultima_mensagem?: string;
  ultima_atualizacao: string;
}

export interface WhatsAppInstanceStatus {
    id: string;
    nome: string;
    instance_id: string;
    whatsapp: string;
    status: string;
}

export interface ConnectionResponse {
    success: boolean;
    connection_data?: {
        pairingCode?: string;
        code?: string;
        count?: number;
    };
    error?: string;
} 