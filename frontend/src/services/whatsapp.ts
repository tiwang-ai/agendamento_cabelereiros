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

  generateQrCode: async (estabelecimento_id: string): Promise<QRCodeResponse> => {
    const response = await api.get(`/api/whatsapp/qr-code/${estabelecimento_id}/`);
    return response.data;
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
  }
};