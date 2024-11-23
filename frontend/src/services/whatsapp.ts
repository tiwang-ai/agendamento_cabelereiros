// frontend/src/services/whatsapp.ts
import api from './api';

export const WhatsAppService = {
  getAllInstances: async () => {
    const response = await api.get('/admin/whatsapp/instances/');
    return response.data;
  },

  reconnect: async (salonId: string) => {
    try {
      const response = await api.post(`/whatsapp/reconnect/${salonId}/`);
      return response.data;
    } catch (error) {
      console.error('Erro detalhado:', error);
      throw error;
    }
  },

  getStatus: async (salonId: string) => {
    const response = await api.get(`/whatsapp/status/${salonId}/`);
    return response.data;
  },

  generateQrCode: async (salonId: string) => {
    const response = await api.get(`/whatsapp/qr-code/${salonId}/`);
    return response.data;
  }
};