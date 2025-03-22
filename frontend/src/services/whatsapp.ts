import axios from 'axios';
import { WhatsAppStatus, WhatsAppLog } from '@/types';

const API_BASE_URL = import.meta.env.VITE_EVOLUTION_API_URL;
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': API_KEY
  }
});

export const whatsappService = {
  async getConnectionStatus(instanceId: string): Promise<WhatsAppStatus> {
    try {
      const [stateResponse, deviceResponse] = await Promise.all([
        api.get(`/instance/connectionState/${instanceId}`),
        api.get(`/instance/device/${instanceId}`)
      ]);

      return {
        status: stateResponse.data.state,
        qrCode: stateResponse.data.qrcode,
        batteryLevel: deviceResponse.data.battery,
        lastSeen: deviceResponse.data.lastSeen,
        webhookUrl: deviceResponse.data.webhookUrl
      };
    } catch (error) {
      return {
        status: 'ERROR',
        error: 'Falha ao obter status da conexão'
      };
    }
  },

  async getQRCode(instanceId: string): Promise<string> {
    const response = await api.get(`/instance/qrcode/${instanceId}`);
    return response.data.qrcode;
  },

  async disconnect(instanceId: string): Promise<void> {
    await api.delete(`/instance/logout/${instanceId}`);
  },

  async getLogs(instanceId: string, limit = 50): Promise<WhatsAppLog[]> {
    try {
      const response = await api.get(`/instance/logs/${instanceId}?limit=${limit}`);
      return response.data.logs;
    } catch (error) {
      console.error('Erro ao obter logs:', error);
      return [];
    }
  },

  async setWebhook(instanceId: string, url: string): Promise<void> {
    await api.post(`/instance/webhook/${instanceId}`, { 
      url,
      events: ['messages', 'status', 'qrcode', 'connection']
    });
  },

  async restartInstance(instanceId: string): Promise<void> {
    await api.post(`/instance/restart/${instanceId}`);
  },

  async sendTestMessage(instanceId: string, to: string): Promise<void> {
    await api.post(`/message/text/${instanceId}`, {
      number: to,
      options: {
        delay: 1200,
        presence: 'composing'
      },
      textMessage: {
        text: '🤖 Mensagem de teste do sistema. Se você recebeu esta mensagem, a conexão está funcionando corretamente!'
      }
    });
  },

  async getWebhookConfig(instanceId: string): Promise<string | null> {
    try {
      const response = await api.get(`/instance/webhook/${instanceId}`);
      return response.data.webhook?.url || null;
    } catch (error) {
      console.error('Erro ao obter configuração do webhook:', error);
      return null;
    }
  }
};