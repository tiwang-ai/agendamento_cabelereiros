import api from './api';

export const SalonBotService = {
  checkExistingInstance: async (salonId: string) => {
    console.log('=== VERIFICANDO INSTÂNCIA DO SALÃO ===');
    console.log('SalonId:', salonId);
    
    const response = await api.get(`/api/salon/${salonId}/whatsapp/instance/check/`);
    
    if (!response.data.exists) {
      // Se não existe, criar instância automaticamente
      return await SalonBotService.createInstance(salonId);
    }
    
    // Se existe, verificar status
    const statusResponse = await SalonBotService.getStatus(salonId);
    if (statusResponse.state === 'disconnected') {
      // Se desconectado, gerar QR code
      const qrResponse = await SalonBotService.generateQrCode(salonId);
      return {
        ...statusResponse,
        qrCode: qrResponse.code
      };
    }
    
    return statusResponse;
  },

  createInstance: async (salonId: string) => {
    console.log('=== CRIANDO INSTÂNCIA DO SALÃO ===');
    const response = await api.post(`/api/salon/${salonId}/whatsapp/instance/create/`);
    
    if (response.data.success) {
      // Se criou com sucesso, gerar QR code
      const qrResponse = await SalonBotService.generateQrCode(salonId);
      return {
        ...response.data,
        qrCode: qrResponse.code
      };
    }
    
    return response.data;
  },

  getStatus: async (salonId: string) => {
    console.log('=== VERIFICANDO STATUS DO BOT DO SALÃO ===');
    const response = await api.get(`/api/salon/${salonId}/whatsapp/status/`);
    return response.data;
  },

  generateQrCode: async (salonId: string) => {
    console.log('=== GERANDO QR CODE PARA SALÃO ===');
    const response = await api.post(`/api/salon/${salonId}/whatsapp/qr-code/`);
    return response.data;
  },

  connect: async (salonId: string) => {
    return api.post(`/api/salon/${salonId}/whatsapp/connect/`);
  },

  disconnect: async (salonId: string) => {
    return api.post(`/api/salon/${salonId}/whatsapp/disconnect/`);
  }
}; 