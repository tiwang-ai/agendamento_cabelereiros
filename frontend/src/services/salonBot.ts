import api from './api';
import { WhatsAppService } from './whatsapp';
import type { BotSettingsData, SalonBotConfig } from '../types/bot';

export const SalonBotService = {
  getConfig: async (estabelecimentoId: string) => {
    const response = await api.get(`/api/admin/bot/status/${estabelecimentoId}/`);
    return response.data;
  },

  saveConfig: async (estabelecimentoId: string, config: any) => {
    const response = await api.patch(`/api/admin/bot/status/${estabelecimentoId}/`, config);
    return response.data;
  },
  
  // Implementação do método updateBotStatus
  updateBotStatus: async (estabelecimentoId: string, status: boolean) => {
    const response = await api.patch(`/api/admin/bot/status/${estabelecimentoId}/`, { bot_ativo: status });
    return response.data;
  },

  connect: async (estabelecimentoId: string) => {
    const response = await api.post(`/api/whatsapp/instance/connect/${estabelecimentoId}/`);
    return response.data;
  },

  disconnect: async (estabelecimentoId: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot/disconnect/'
      : `/api/whatsapp/disconnect/${estabelecimentoId}/`;
    const response = await api.post(endpoint);
    return response.data;
  },

  generateQrCode: async (estabelecimentoId: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot/qr-code/'
      : `/api/whatsapp/qr-code/${estabelecimentoId}/`;
    
    const response = await api.post(endpoint);
    return response.data;
  },

  sendMessage: async (estabelecimentoId: string, number: string, message: string, options?: any) => {
    const response = await api.post(`/api/whatsapp/send-message/${estabelecimentoId}/`, {
      number,
      message,
      ...options
    });
    return response.data;
  },

  checkExistingInstance: async (estabelecimentoId: string, isSupport: boolean = false) => {
    const response = await api.get(isSupport 
      ? `/api/admin/bot/instance/check/support/`
      : `/api/whatsapp/instance/check/${estabelecimentoId}/`);
    return response.data;
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