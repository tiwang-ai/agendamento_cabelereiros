import api from './api';
import type { WhatsAppInstance, WhatsAppStatus, QRCodeResponse, SalonBotConfig, ChatConfig } from '../types/bot';

export const SalonBotService = {
  // Funções de WhatsApp do Bot 2
  checkExistingInstance: async (salonId: string): Promise<WhatsAppInstance> => {
    try {
      console.log('=== VERIFICANDO INSTÂNCIA DO SALÃO ===');
      const response = await api.get(`/api/salon/${salonId}/whatsapp/instance/check/`);
      
      if (!response.data.exists) {
        return await SalonBotService.createInstance(salonId);
      }
      
      const statusResponse = await SalonBotService.getStatus(salonId);
      if (statusResponse.state === 'disconnected') {
        const qrResponse = await SalonBotService.generateQrCode(salonId);
        return {
          ...statusResponse,
          qrCode: qrResponse.code,
          exists: true
        };
      }
      
      return {
        ...statusResponse,
        exists: true
      };
    } catch (error) {
      console.error('Erro ao verificar instância:', error);
      throw new Error('Falha ao verificar instância do WhatsApp');
    }
  },

  createInstance: async (salonId: string): Promise<WhatsAppInstance> => {
    console.log('=== CRIANDO INSTÂNCIA DO SALÃO ===');
    const response = await api.post(`/api/salon/${salonId}/whatsapp/instance/create/`);
    
    if (response.data.success) {
      // Configurar webhook automaticamente após criar instância
      await SalonBotService.updateWebhookConfig(salonId, {
        enabled: true,
        url: `${import.meta.env.VITE_NGROK_URL || window.location.origin}/api/webhooks/salon/${salonId}/`,
        events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE"]
      });
      
      // Gerar QR code após configurar webhook
      const qrResponse = await SalonBotService.generateQrCode(salonId);
      return {
        ...response.data,
        qrCode: qrResponse.code
      };
    }
    
    return response.data;
  },

  getStatus: async (salonId: string): Promise<WhatsAppStatus> => {
    console.log('=== VERIFICANDO STATUS DO BOT DO SALÃO ===');
    const response = await api.get(`/api/salon/${salonId}/whatsapp/status/`);
    return response.data;
  },

  generateQrCode: async (salonId: string): Promise<QRCodeResponse> => {
    console.log('=== GERANDO QR CODE PARA SALÃO ===');
    const response = await api.post(`/api/salon/${salonId}/whatsapp/qr-code/`);
    return response.data;
  },

  connect: async (salonId: string) => {
    return api.post(`/api/salon/${salonId}/whatsapp/connect/`);
  },

  disconnect: async (salonId: string) => {
    return api.post(`/api/salon/${salonId}/whatsapp/disconnect/`);
  },

  // Funções de configuração do Bot 2
  getBotConfig: async (salonId: string): Promise<SalonBotConfig> => {
    const response = await api.get(`/api/salon/${salonId}/bot/config/`);
    return response.data;
  },

  updateBotConfig: async (salonId: string, config: Partial<SalonBotConfig>): Promise<SalonBotConfig> => {
    const response = await api.patch(`/api/salon/${salonId}/bot/config/`, config);
    return response.data;
  },

  updateWebhookConfig: async (salonId: string, config: {
    enabled: boolean;
    url: string;
    events: string[];
  }) => {
    const response = await api.post(`/api/salon/${salonId}/whatsapp/webhook/config/`, config);
    return response.data;
  },

  getChats: async (): Promise<ChatConfig[]> => {
    const response = await api.get('/api/salon/chats/');
    return response.data;
  },

  toggleBot: async (chatId: number, active: boolean): Promise<any> => {
    const response = await api.patch(`/api/salon/chats/${chatId}/`, {
        bot_ativo: active
    });
    return response.data;
  }
}; 