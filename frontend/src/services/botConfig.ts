// frontend/src/services/botConfig.ts
import api from './api';
import { WhatsAppService } from './whatsapp';
import type { BotSettingsData } from '../types/bot';

export const BotConfigService = {
    getConfig: async () => {
        try {
            const response = await api.get('/api/admin/bot-config/');
            return response.data;
        } catch (error) {
            console.error('Erro detalhado ao obter configuração:', error);
            throw error;
        }
    },

    saveConfig: async (config: {
        support_whatsapp: string;
        bot_ativo?: boolean;
    }) => {
        try {
            const response = await api.post('/api/admin/bot-config/', config);
            return response.data;
        } catch (error) {
            console.error('Erro detalhado ao salvar configuração:', error);
            throw error;
        }
    },

    getStatus: async () => {
        const response = await api.get('/api/admin/bot-config/status/');
        return response.data;
    },
    
    getConnectionStatus: async () => {
        const response = await api.get('/api/admin/bot-config/connection/');
        return response.data;
    },

    generateQRCode: async () => {
        const response = await api.post('/api/admin/bot-config/qr-code/');
        return response.data;
    },

    connect: async () => {
        return WhatsAppService.connect('support', true);
    },

    getBotSettings: async (): Promise<BotSettingsData> => {
        try {
            const response = await api.get('/api/admin/bot-config/settings/');
            return response.data || {
                bot_ativo: true,
                prompt_template: '',
                attendance_mode: 'auto',
                evolution_settings: {
                    reject_calls: true,
                    read_messages: true,
                    groups_ignore: true
                },
                horario_atendimento: {
                    inicio: '09:00',
                    fim: '18:00'
                }
            };
        } catch (error) {
            console.error('Erro ao obter configurações:', error);
            throw error;
        }
    },

    saveBotSettings: async (settings: BotSettingsData) => {
        try {
            const response = await api.patch('/api/admin/bot-config/settings/', settings);
            return response.data;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            throw error;
        }
    },

    getMetrics: async () => {
        const response = await api.get('/api/admin/bot-config/metrics/');
        return response.data;
    },

    updateSettings: async (settings: {
        support_whatsapp: string;
        prompt_template: string;
        attendance_mode: 'auto' | 'semi' | 'manual';
        evolution_settings: {
            reject_calls: boolean;
            read_messages: boolean;
            groups_ignore: boolean;
        };
        mensagem_boas_vindas: string;
        horario_atendimento: {
            inicio: string;
            fim: string;
        };
    }) => {
        const response = await api.patch('/api/admin/bot-config/settings/', settings);
        return response.data;
    },

    getConnectionData: async () => {
        const response = await api.get('/api/admin/bot-config/connection/');
        return response.data;
    },

    getQrCode: async () => {
        try {
            const response = await api.post('/api/admin/bot-config/qr-code/');
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data;
        } catch (error) {
            console.error('Erro ao gerar QR code:', error);
            throw error;
        }
    }
};