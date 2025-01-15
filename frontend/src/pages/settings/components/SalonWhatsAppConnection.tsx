import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import React, { useState, useEffect } from 'react';
import { SalonBotService } from '../../../services/salonBot';
import { useAuth } from '../../../contexts/AuthContext';

interface ConnectionData {
  pairingCode?: string;
  code?: string;
  count?: number;
}

interface SalonWhatsAppConnectionProps {
  salonId: string;
}

const SalonWhatsAppConnection = ({ salonId }: SalonWhatsAppConnectionProps) => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [hasInstance, setHasInstance] = useState(false);

  useEffect(() => {
    if (salonId) {
      console.log('=== INICIANDO VERIFICAÇÃO DE INSTÂNCIA ===');
      console.log('SalonId:', salonId);
      checkInstance();
    }
  }, [salonId]);

  const checkInstance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('=== VERIFICANDO EXISTÊNCIA DA INSTÂNCIA ===');
      console.log('SalonId:', salonId);
      
      const instanceExists = await SalonBotService.checkExistingInstance(salonId);
      console.log('Resposta da verificação:', instanceExists);
      setHasInstance(instanceExists.exists);
      
      if (instanceExists.exists) {
        console.log('Instância existe, verificando status...');
        await checkStatus();
      } else {
        console.log('Instância não existe, criando uma nova instância...');
        await createInstance();
      }
    } catch (error) {
      console.error('Erro ao verificar instância:', error);
      setError('Erro ao verificar instância');
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    try {
      console.log('=== VERIFICANDO STATUS DA CONEXÃO ===');
      console.log('SalonId:', salonId);
      
      const response = await SalonBotService.getStatus(salonId);
      console.log('Resposta do status:', response);
      setStatus(response.state);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setError('Erro ao verificar status da conexão');
    }
  };

  const createInstance = async () => {
    try {
      console.log('=== CRIANDO INSTÂNCIA ===');
      
      const response = await SalonBotService.createInstance(salonId);
      console.log('Resposta da criação da instância:', response);
      
      if (response.exists) {
        setHasInstance(true);
        setStatus('disconnected');
        console.log('Instância criada com sucesso.');
        await handleGeneratePairingCode();
      } else {
        setError('Erro ao criar instância');
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      setError('Erro ao criar instância');
    }
  };

  const handleGeneratePairingCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('=== GERANDO QR CODE ===');
      console.log('SalonId:', salonId);
      
      const qrData = await SalonBotService.generateQrCode(salonId);
      console.log('Resposta do QR Code:', qrData);
      
      // Certifique-se de que o código está no formato correto para exibir no QRCodeSVG
      if (qrData.code && !qrData.code.startsWith('data:image')) {
        qrData.code = `data:image/png;base64,${qrData.code}`;
      }
      
      setConnectionData(qrData);
      setStatus('connecting');
    } catch (error) {
      console.error('Erro ao gerar código de pareamento:', error);
      setError('Erro ao gerar código de pareamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Conexão WhatsApp
        </Typography>

        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 2 
          }}>
            {status === 'connected' ? (
              <Alert severity="success">
                WhatsApp conectado com sucesso!
              </Alert>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                {isLoading ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 2,
                    mt: 4 
                  }}>
                    <CircularProgress />
                    <Typography color="text.secondary">
                      Verificando status da conexão...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 3 
                  }}>
                    {connectionData?.code ? (
                      <>
                        <Box component="div">
                          <Box
                            component={QRCodeSVG}
                            value={connectionData.code}
                            size={256}
                            style={{ display: 'block', margin: 'auto' }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" align="center">
                          Abra o WhatsApp no seu celular e escaneie o QR Code
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={handleGeneratePairingCode}
                          sx={{ mt: 2 }}
                        >
                          Gerar Novo QR Code
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleGeneratePairingCode}
                        disabled={isLoading}
                        sx={{ mt: 4 }}
                      >
                        Gerar Código de Pareamento
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SalonWhatsAppConnection; 