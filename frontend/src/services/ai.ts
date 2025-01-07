// frontend/src/services/ai.ts
import api from './api';

export const AIService = {
  processMessage: async (message: string, botType: 1 | 2) => {
    const response = await api.post('/api/bot/process/', {
      pergunta: message,
      bot_tipo: botType
    });
    return response.data;
  },

  getWhatsAppStatus: async (salonId: string) => {
    const response = await api.get(`/api/whatsapp/status/${salonId}`);
    return response.data;
  }
};