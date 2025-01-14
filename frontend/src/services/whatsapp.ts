// frontend/src/services/whatsapp.ts
import { QRCodeResponse, WhatsAppStatus } from '../types/whatsapp';
import api from './api';

export const WhatsAppService = {
  getAllInstances: async () => {
    const response = await api.get('/api/whatsapp/instances/status/');
    return response.data;
  },

  getStatus: async (instanceId: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot/status/'
      : `/api/whatsapp/status/${instanceId}/`;
    
    const response = await api.get(endpoint);
    return response.data;
  },

  connect: async (instanceId: string) => {
    const response = await api.post(`/api/whatsapp/instance/connect/${instanceId}/`);
    return response.data;
  },

  disconnect: async (salonId: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot/disconnect/'
      : `/api/whatsapp/disconnect/${salonId}/`;
    const response = await api.post(endpoint);
    return response.data;
  },

  generateQrCode: async (instanceId: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot/qr-code/'
      : `/api/whatsapp/qr-code/${instanceId}/`;
    
    const response = await api.post(endpoint);
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

  checkExistingInstance: async (instanceId: string, isSupport: boolean = false) => {
    const response = await api.get(isSupport 
        ? '/api/admin/bot/instance/check/support/'
        : `/api/whatsapp/instance/check/${instanceId}/`);
    return response.data;
  }
};