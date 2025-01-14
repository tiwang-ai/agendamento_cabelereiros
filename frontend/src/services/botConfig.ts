// frontend/src/services/botConfig.ts
import api from './api';
import { WhatsAppService } from './whatsapp';
import type { BotSettingsData } from '../types/bot';
import { gerar_prompt_bot1 } from '../utils/prompts';

export const StaffBotService = {
    getConfig: async () => {
        const response = await api.get('/api/admin/bot/config/');
        return response.data;
    },

    saveConfig: async (config: {
        support_whatsapp: string;
        bot_ativo?: boolean;
    }) => {
        try {
            const response = await api.post('/api/admin/bot/config/', {
                ...config,
                prompt_template: gerar_prompt_bot1()
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao salvar configuração:', error);
            throw error;
        }
    },

    getStatus: async () => {
        try {
            return await WhatsAppService.getStatus('support', true);
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            throw error;
        }
    },
    
    getConnectionStatus: async () => {
        const response = await api.get('/api/admin/bot/connection/');
        return response.data;
    },

    generateQrCode: async () => {
        try {
            return await WhatsAppService.generateQrCode('support', true);
        } catch (error) {
            console.error('Erro ao gerar QR code:', error);
            throw error;
        }
    },

    connect: async () => {
        return WhatsAppService.connect('support_bot', true);
    },

    getBotSettings: async (): Promise<BotSettingsData> => {
        try {
            const response = await api.get('/api/admin/bot/config/');
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
            const baseUrl = import.meta.env.VITE_NGROK_URL || window.location.origin;
            
            const { status, ...settingsWithoutStatus } = settings;
            
            // Envia todas as configurações, incluindo o estado do bot e webhook
            const response = await api.post('/api/admin/bot/config/', {
                ...settingsWithoutStatus,
                bot_ativo: settings.bot_ativo,
                webhook_settings: {
                    enabled: settings.bot_ativo,
                    url: settings.bot_ativo ? `${baseUrl}/api/webhooks/support/` : '',
                    events: settings.bot_ativo ? ["MESSAGES_UPSERT", "MESSAGES_UPDATE"] : []
                }
            });

            // Retorna os dados atualizados do servidor
            return response.data;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            throw error;
        }
    },

    getMetrics: async () => {
        try {
            const [metricsResponse, interactionsResponse] = await Promise.all([
                api.get('/api/admin/bot/metrics/'),
                api.get('/api/admin/bot/interactions/')
            ]);
            
            return {
                ...metricsResponse.data,
                interactions: interactionsResponse.data
            };
        } catch (error) {
            console.error('Erro ao carregar métricas:', error);
            throw error;
        }
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
        const response = await api.patch('/api/admin/bot/config/', settings);
        return response.data;
    },

    getConnectionData: async () => {
        const response = await api.get('/api/admin/bot/connection/');
        return response.data;
    },

    getQrCode: async () => {
        try {
            const response = await api.post('/api/admin/bot/qr-code/');
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data;
        } catch (error) {
            console.error('Erro ao gerar QR code:', error);
            throw error;
        }
    },

    updateWebhookConfig: async (webhookConfig: {
        enabled: boolean;
        url: string;
        events: string[];
        salonId?: string;
    }) => {
        try {
            const endpoint = webhookConfig.salonId 
                ? `/api/webhooks/${webhookConfig.salonId}/`
                : '/api/admin/bot/webhook/config/';
            const data = {
                enabled: webhookConfig.enabled,
                url: webhookConfig.enabled ? webhookConfig.url : '',
                events: webhookConfig.enabled ? webhookConfig.events : []
            };
            const response = await api.post(endpoint, data);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar webhook:', error);
            throw error;
        }
    },

    checkExistingInstance: async () => {
        try {
            return await WhatsAppService.checkExistingInstance('support', true);
        } catch (error) {
            console.error('Erro ao verificar instância:', error);
            throw error;
        }
    }
};