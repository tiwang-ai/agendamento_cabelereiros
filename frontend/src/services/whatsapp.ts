// frontend/src/services/whatsapp.ts
import { QRCodeResponse, WhatsAppStatus } from '../types/whatsapp';

import api from './api';

export const WhatsAppService = {
  getAllInstances: async () => {
    const response = await api.get('/admin/whatsapp/instances/');
    return response.data;
  },

  reconnect: async (estabelecimento_id: string) => {
    try {
      console.log('Tentando reconectar estabelecimento:', estabelecimento_id);
      
      const response = await api.post(`/whatsapp/reconnect/${estabelecimento_id}/`, {
        estabelecimento_id: estabelecimento_id
      });
      
      console.log('Resposta da reconexão:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro detalhado da reconexão:', error.response?.data || error);
      throw error;
    }
  },

  getStatus: async (estabelecimento_id: string): Promise<WhatsAppStatus> => {
    try {
      const response = await api.get(`/whatsapp/status/${estabelecimento_id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  },

  generateQrCode: async (estabelecimento_id: string): Promise<QRCodeResponse> => {
    try {
      const response = await api.get(`/whatsapp/qr-code/salon_${estabelecimento_id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      throw error;
    }
  },

  sendMessage: async (salonId: string, number: string, message: string, options?: any) => {
    try {
      const response = await api.post(`/whatsapp/send-message/${salonId}/`, {
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
      const response = await api.get(`/whatsapp/logs/${salonId}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      throw error;
    }
  },

  createInstance: async (salonId: string) => {
    const response = await api.post(`/whatsapp/create-instance/${salonId}/`);
    return response.data;
  },

  generatePairingCode: async (salonId: string) => {
    try {
      const response = await api.get(`/whatsapp/pairing-code/${salonId}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar código de pareamento:', error);
      throw error;
    }
  },

  getChats: async () => {
    const response = await api.get('/whatsapp/chats/');
    return response.data;
  },

  toggleBot: async (chatId: number, status: boolean) => {
    const response = await api.patch(`/whatsapp/chats/${chatId}/`, {
      bot_ativo: status
    });
    return response.data;
  },

  checkConnectionStatus: async (estabelecimento_id: string) => {
    try {
      const response = await api.get(`/whatsapp/connection-status/${estabelecimento_id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  },

  connectInstance: async (estabelecimento_id: string) => {
    try {
      const response = await api.get(`/whatsapp/connect/${estabelecimento_id}`);
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
      const response = await api.patch(`/whatsapp/bot-config/${estabelecimento_id}/`, config);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar configuração do bot:', error);
      throw error;
    }
  }
};