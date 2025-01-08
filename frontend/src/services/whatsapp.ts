// frontend/src/services/whatsapp.ts
import { QRCodeResponse, WhatsAppStatus } from '../types/whatsapp';
import api from './api';

export const WhatsAppService = {
  getAllInstances: async () => {
    const response = await api.get('/api/whatsapp/instances/status/');
    return response.data;
  },

  getStatus: async (salonId: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot/status/'
      : `/api/whatsapp/status/${salonId}/`;
    const response = await api.get(endpoint);
    return response.data;
  },

  connect: async (salonId: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot/connection/'
      : `/api/whatsapp/connect/${salonId}/`;
    const response = await api.get(endpoint);
    return response.data;
  },

  disconnect: async (salonId: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot/disconnect/'
      : `/api/whatsapp/disconnect/${salonId}/`;
    const response = await api.post(endpoint);
    return response.data;
  },

  generateQrCode: async (salonId: string, isSupport: boolean = false): Promise<QRCodeResponse> => {
    const endpoint = isSupport 
      ? '/api/admin/bot/qr-code/'
      : `/api/whatsapp/qr-code/${salonId}/`;
    
    const response = await api.post(endpoint);
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    return {
      code: response.data.code,
      pairingCode: response.data.pairingCode,
      count: response.data.count
    };
  },

  sendMessage: async (salonId: string, number: string, message: string, options?: any) => {
    const response = await api.post(`/api/whatsapp/send-message/${salonId}/`, {
      number,
      message,
      ...options
    });
    return response.data;
  },

  checkExistingInstance: async (salonId: string, isSupport: boolean = false) => {
    const endpoint = isSupport 
      ? '/api/admin/bot/instance/check/'
      : `/api/whatsapp/instance/check/${salonId}/`;
    
    const response = await api.get(endpoint);
    
    return {
      exists: response.data.exists,
      instanceName: response.data.instance_name,
      status: response.data.status
    };
  }
};