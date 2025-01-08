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

  getStatus: async (salonId: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot/status/'
      : `/api/whatsapp/status/${salonId}/`;
    const response = await api.get(endpoint);
    return response.data;
  },

  connect: async (salonId: string, isSupport: boolean = false) => {
    try {
        console.log('Conectando instância:', salonId, 'isSupport:', isSupport);
        const endpoint = isSupport 
            ? '/api/admin/bot/connection/'
            : `/api/whatsapp/connect/${salonId}/`;
                
        const response = await api.get(endpoint);
        console.log('Resposta da conexão:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erro na conexão:', error);
        throw error;
    }
  },

  generateQrCode: async (salonId: string, isSupport: boolean = false): Promise<QRCodeResponse> => {
    try {
      const endpoint = isSupport 
        ? '/api/admin/bot/qr-code/'
        : `/api/whatsapp/qr-code/${salonId}/`;
                    
      const response = await api.post(endpoint);
      console.log('QR Code response:', response.data); // Debug
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      return {
        code: response.data.code,
        pairingCode: response.data.pairingCode,
        count: response.data.count
      };
    } catch (error: any) {
      console.error('Erro ao gerar QR code:', error);
      throw new Error(error.response?.data?.error || error.message);
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

  updateBotConfig: async (salonId: string, config: {
    bot_ativo: boolean;
    aceitar_nao_clientes: boolean;
    mensagem_nao_cliente?: string;
  }) => {
    const response = await api.patch(`/api/whatsapp/bot/${salonId}/`, config);
    return response.data;
  },

  checkExistingInstance: async (isSupport: boolean = false) => {
    try {
      const endpoint = isSupport 
        ? '/api/admin/bot/instance/check/'
        : '/api/whatsapp/instances/status/';
                    
      const response = await api.get(endpoint);
      console.log('Check Instance response:', response.data); // Debug
      
      return {
        exists: response.data.exists,
        instanceName: response.data.instance_name,
        status: response.data.status
      };
    } catch (error) {
      console.error('Erro ao verificar instância:', error);
      return { exists: false, instanceName: null, status: null };
    }
  }
};