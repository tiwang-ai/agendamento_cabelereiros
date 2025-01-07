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
}

export interface BotMetrics {
    today_interactions: number;
    avg_response_time: string;
    resolution_rate: string;
    ai_interactions: number;
} 