// frontend/src/services/botConfig.ts
import api from './api';

export const BotConfigService = {
    getConfig: async () => {
        const response = await api.get('/admin/bot-config/');
        return response.data;
    },

    saveConfig: async (config: {
        support_whatsapp: string;
    }) => {
        const response = await api.post('/admin/bot-config/', config);
        return response.data;
    },

    getStatus: async () => {
        const response = await api.get('/admin/bot-config/status/');
        return response.data;
    }
};