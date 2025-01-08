export interface BotSettingsData {
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

export interface SalonBotConfig {
    bot_ativo: boolean;
    aceitar_nao_clientes: boolean;
    mensagem_nao_cliente?: string;
    horario_atendimento: {
        inicio: string;
        fim: string;
    };
    dias_atendimento: string[];
    mensagem_fora_horario?: string;
    mensagem_bot_desativado?: string;
}

export interface BotMetrics {
    today_interactions: number;
    avg_response_time: string;
    resolution_rate: string;
    ai_interactions: number;
} 