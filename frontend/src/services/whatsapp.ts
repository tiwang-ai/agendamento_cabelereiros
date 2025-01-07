// frontend/src/services/whatsapp.ts
import { QRCodeResponse, WhatsAppStatus } from '../types/whatsapp';
import api from './api';

export const WhatsAppService = {
  getAllInstances: async () => {
    console.log('Iniciando getAllInstances');
    try {
      const response = await api.get('/api/whatsapp/instances/status/');
      console.log('Resposta getAllInstances:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro detalhado getAllInstances:', error);
      throw error;
    }
  },

  getStatus: async (id: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot-config/status/'
      : `/api/whatsapp/status/${id}/`;
    const response = await api.get(endpoint);
    return response.data;
  },

  connect: async (id: string, isSupport: boolean = false) => {
    try {
        console.log('Conectando instância:', id, 'isSupport:', isSupport); // Debug
        const endpoint = isSupport 
            ? '/api/admin/bot-config/connection/'
            : `/api/whatsapp/connect/${id}/`;
        const response = await api.post(endpoint);
        console.log('Resposta da conexão:', response.data); // Debug
        return response.data;
    } catch (error) {
        console.error('Erro na conexão:', error);
        throw error;
    }
  },

  generateQrCode: async (estabelecimento_id: string, isSupport: boolean = false) => {
    try {
      const endpoint = isSupport 
        ? '/api/admin/bot-config/qr-code/'
        : `/api/whatsapp/qr-code/${estabelecimento_id}/`;
                
      const response = await api.post(endpoint);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      throw error;
    }
  },

  sendMessage: async (salonId: string, number: string, message: string, options?: any) => {
    const response = await api.post(`/api/whatsapp/send-message/${salonId}/`, {
      number,
      message,
      ...options
    });
    return response.data;
  },

  updateBotConfig: async (estabelecimento_id: string, config: {
    bot_ativo: boolean;
    aceitar_nao_clientes: boolean;
    mensagem_nao_cliente?: string;
  }) => {
    const response = await api.patch(`/api/whatsapp/bot-config/${estabelecimento_id}/`, config);
    return response.data;
  },

  checkExistingInstance: async (isSupport: boolean = false) => {
    try {
      const endpoint = isSupport 
        ? '/api/admin/bot-config/instance/check/'
        : '/api/whatsapp/instances/status/';
                
      const response = await api.get(endpoint);
      return response.data.exists;
    } catch (error) {
      console.error('Erro ao verificar instância:', error);
      return false;
    }
  }
};