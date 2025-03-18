import React, { useEffect, useState } from 'react';
import { whatsappService, WhatsAppStatus, WhatsAppLog } from '@/services/whatsapp';
import { useAuth } from '@/contexts/AuthContext';
import QRCode from 'qrcode.react';

export default function WhatsAppConnection() {
  const { user } = useAuth();
  const [status, setStatus] = useState<WhatsAppStatus>({ status: 'DISCONNECTED' });
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testNumber, setTestNumber] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.estabelecimento_id) return;
      
      try {
        const [currentStatus, currentLogs, currentWebhook] = await Promise.all([
          whatsappService.getConnectionStatus(user.estabelecimento_id),
          whatsappService.getLogs(user.estabelecimento_id),
          whatsappService.getWebhookConfig(user.estabelecimento_id)
        ]);
        setStatus(currentStatus);
        setLogs(currentLogs);
        if (currentWebhook) {
          setWebhookUrl(currentWebhook);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleDisconnect = async () => {
    if (!user?.estabelecimento_id) return;
    
    try {
      await whatsappService.disconnect(user.estabelecimento_id);
      setStatus({ status: 'DISCONNECTED' });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  };

  const handleRestart = async () => {
    if (!user?.estabelecimento_id) return;
    
    try {
      await whatsappService.restartInstance(user.estabelecimento_id);
      setStatus({ status: 'CONNECTING' });
    } catch (error) {
      console.error('Erro ao reiniciar instância:', error);
    }
  };

  const handleSetWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.estabelecimento_id || !webhookUrl) return;

    setIsSettingWebhook(true);
    try {
      await whatsappService.setWebhook(user.estabelecimento_id, webhookUrl);
      alert('Webhook configurado com sucesso!');
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      alert('Erro ao configurar webhook');
    } finally {
      setIsSettingWebhook(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.estabelecimento_id || !testNumber) return;

    setIsSending(true);
    try {
      await whatsappService.sendTestMessage(user.estabelecimento_id, testNumber);
      alert('Mensagem de teste enviada com sucesso!');
      setTestNumber('');
    } catch (error) {
      console.error('Erro ao enviar mensagem de teste:', error);
      alert('Erro ao enviar mensagem de teste');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Conexão WhatsApp</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                status.status === 'CONNECTED' ? 'bg-green-500' :
                status.status === 'CONNECTING' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className="text-lg font-medium">
                Status: {status.status}
              </span>
            </div>

            {/* Device Info */}
            {status.status === 'CONNECTED' && (
              <div className="space-y-2">
                {status.batteryLevel && (
                  <p className="text-sm text-gray-600">
                    Bateria: {status.batteryLevel}%
                  </p>
                )}
                {status.lastSeen && (
                  <p className="text-sm text-gray-600">
                    Última atividade: {new Date(status.lastSeen).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* QR Code Section */}
          {status.status === 'DISCONNECTED' && status.qrCode && (
            <div className="flex flex-col items-center space-y-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <QRCode value={status.qrCode} size={256} />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Escaneie o QR Code com seu WhatsApp para conectar
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {status.status === 'CONNECTED' && (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Desconectar
              </button>
            )}
            {status.status === 'ERROR' && (
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                Reiniciar Instância
              </button>
            )}
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Configuração de Webhook</h2>
          <form onSubmit={handleSetWebhook} className="space-y-4">
            <div>
              <label htmlFor="webhook" className="block text-sm font-medium text-gray-700">
                URL do Webhook
              </label>
              <input
                type="url"
                id="webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://seu-dominio.com/webhook"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSettingWebhook}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSettingWebhook ? 'Configurando...' : 'Configurar Webhook'}
            </button>
          </form>
        </div>

        {/* Test Message */}
        {status.status === 'CONNECTED' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Enviar Mensagem de Teste</h2>
            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label htmlFor="testNumber" className="block text-sm font-medium text-gray-700">
                  Número do WhatsApp
                </label>
                <input
                  type="tel"
                  id="testNumber"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="5511999999999"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Digite o número com DDI e DDD, sem espaços ou caracteres especiais
                </p>
              </div>
              <button
                type="submit"
                disabled={isSending}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSending ? 'Enviando...' : 'Enviar Mensagem de Teste'}
              </button>
            </form>
          </div>
        )}

        {/* Logs Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Logs do Sistema</h2>
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded ${
                  log.level === 'error' ? 'bg-red-50 text-red-700' :
                  log.level === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium">{log.event}</span>
                  <span className="text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}