// frontend/src/services/whatsapp.ts
import api from './api';
import { QRCodeResponse, WhatsAppStatus } from '../types/whatsapp';

export const WhatsAppService = {
  getAllInstances: async () => {
    const response = await api.get('/admin/whatsapp/instances/');
    return response.data;
  },

  reconnect: async (estabelecimento_id: string) => {
    try {
      const response = await api.post(`/whatsapp/reconnect/${estabelecimento_id}/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao reconectar:', error);
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

  checkConnectionStatus: async (salonId: string) => {
    const response = await api.get(`/whatsapp/connection-status/${salonId}/`);
    return response.data;
  }
};