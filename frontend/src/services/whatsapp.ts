// frontend/src/services/whatsapp.ts - Serviço geral do WhatsApp (comum para Bot 1 e Bot 2)
import { QRCodeResponse, WhatsAppStatus } from '../types/whatsapp';
import api from './api';

export const WhatsAppService = {
  checkExistingInstance: async (instanceId: string) => {
    console.log('=== VERIFICANDO EXISTÊNCIA DA INSTÂNCIA DE SUPORTE ===');
    const response = await api.get('/api/admin/bot/instance/check/');
    return response.data;
  },

  getStatus: async () => {
    console.log('=== VERIFICANDO STATUS DO BOT DE SUPORTE ===');
    const response = await api.get('/api/admin/bot/status/');
    return response.data;
  },

  generateQrCode: async () => {
    console.log('=== GERANDO QR CODE PARA BOT DE SUPORTE ===');
    const response = await api.post('/api/admin/bot/qr-code/');
    return response.data;
  },

  connect: async () => {
    return api.post('/api/admin/bot/connect/');
  },

  disconnect: async () => {
    return api.post('/api/admin/bot/disconnect/');
  }
};