// frontend/src/services/whatsapp.ts
import { QRCodeResponse, WhatsAppStatus } from '../types/whatsapp';

import api from './api';

export const WhatsAppService = {
  getAllInstances: async () => {
    const response = await api.get('/api/whatsapp/instances/status/');
    return response.data;
  },

  getStatus: async (estabelecimento_id: string) => {
    const response = await api.get(`/api/whatsapp/status/${estabelecimento_id}/`);
    return response.data;
  },

  connect: async (estabelecimento_id: string) => {
    const response = await api.post(`/api/whatsapp/connect/${estabelecimento_id}/`);
    return response.data;
  },

  reconnect: async (estabelecimento_id: string) => {
    const response = await api.post(`/api/whatsapp/connect/${estabelecimento_id}/`);
    return response.data;
  },

  generateQrCode: async (estabelecimento_id: string): Promise<QRCodeResponse> => {
    const response = await api.get(`/api/whatsapp/qr-code/${estabelecimento_id}/`);
    return response.data;
  },

  sendMessage: async (salonId: string, number: string, message: string, options?: any) => {
    try {
      const response = await api.post(`/api/whatsapp/send-message/${salonId}/`, {
        number,
        message,
        ...options
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  },

  getInstanceLogs: async (salonId: string) => {
    try {
      const response = await api.get(`/api/whatsapp/logs/${salonId}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      throw error;
    }
  },

  createInstance: async (salonId: string, phone: string) => {
    try {
      const response = await api.post(`/api/whatsapp/create-instance/${salonId}/`, {
        phone: phone
      });
      console.log('Resposta da criação de instância:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      throw error;
    }
  },

  generatePairingCode: async (salonId: string) => {
    try {
      const response = await api.get(`/api/whatsapp/pairing-code/${salonId}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar código de pareamento:', error);
      throw error;
    }
  },

  getChats: async () => {
    const response = await api.get('/api/whatsapp/chats/');
    return response.data;
  },

  toggleBot: async (chatId: number, status: boolean) => {
    const response = await api.patch(`/api/whatsapp/chats/${chatId}/`, {
      bot_ativo: status
    });
    return response.data;
  },

  checkConnectionStatus: async (estabelecimento_id: string) => {
    try {
      const response = await api.get(`/api/whatsapp/connection-status/${estabelecimento_id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  },

  connectInstance: async (estabelecimento_id: string) => {
    try {
      const response = await api.get(`/api/whatsapp/connect/${estabelecimento_id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      throw error;
    }
  },

  updateBotConfig: async (estabelecimento_id: string, config: {
    bot_ativo: boolean;
    aceitar_nao_clientes: boolean;
    mensagem_nao_cliente?: string;
  }) => {
    try {
      const response = await api.patch(`/api/whatsapp/bot-config/${estabelecimento_id}/`, config);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar configuração do bot:', error);
      throw error;
    }
  }
};