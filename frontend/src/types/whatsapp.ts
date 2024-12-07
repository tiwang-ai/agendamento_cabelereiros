// frontend/src/types/whatsapp.ts
export interface WhatsAppStatus {
  status: 'disconnected' | 'connecting' | 'connected';
  message?: string;
}

export interface QRCodeResponse {
  pairingCode: string;
  code: string; // Base64 QR code string
  count: number;
  error?: string;
}