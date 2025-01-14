import api from './api';
import { WhatsAppService } from './whatsapp';
import type { BotSettingsData, SalonBotConfig } from '../types/bot';

export const SalonBotService = {
    getConfig: async (salonId: string) => {
        const response = await api.get(`/api/whatsapp/bot-config/${salonId}/`);
        return response.data;
    },
    
    saveConfig: async (salonId: string, config: SalonBotConfig) => {
        const response = await api.patch(`/api/whatsapp/bot-config/${salonId}/`, config);
        return response.data;
    },
    
    connect: async (salonId: string) => {
        return WhatsAppService.connect(salonId, false);
    },
    
    disconnect: async (salonId: string) => {
        const response = await api.post(`/api/whatsapp/disconnect/${salonId}/`);
        return response.data;
    },
    
    generateQRCode: async (salonId: string) => {
        return WhatsAppService.generateQrCode(salonId, false);
    },
    
    getStatus: async (salonId: string) => {
        return WhatsAppService.getStatus(salonId, false);
    },
    
    sendMessage: async (salonId: string, number: string, message: string) => {
        return WhatsAppService.sendMessage(salonId, number, message);
    },
    
    getMetrics: async (salonId: string) => {
        const response = await api.get(`/api/whatsapp/metrics/${salonId}/`);
        return response.data;
    },
    
    getInteractions: async (salonId: string) => {
        const response = await api.get(`/api/whatsapp/interactions/${salonId}/`);
        return response.data;
    },
    
    checkConnection: async (salonId: string) => {
        return WhatsAppService.getStatus(salonId, false);
    },
    
    checkExistingInstance: async (salonId: string) => {
        return WhatsAppService.checkExistingInstance(salonId, false);
    },
    
    updateSettings: async (salonId: string, settings: {
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
    }) => {
        const response = await api.patch(`/api/whatsapp/bot-config/${salonId}/`, settings);
        return response.data;
    }
}; 