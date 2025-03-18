export interface WhatsAppInstance {
  id: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
  qrCode?: string;
  error?: string;
  batteryLevel?: number;
  lastSeen?: string;
  webhookUrl?: string;
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  instanceId: string;
}

export interface WhatsAppWebhook {
  instanceId: string;
  event: string;
  data: any;
}

export interface WhatsAppLog {
  id: string;
  timestamp: string;
  event: string;
  details: string;
  level: 'info' | 'warning' | 'error';
}