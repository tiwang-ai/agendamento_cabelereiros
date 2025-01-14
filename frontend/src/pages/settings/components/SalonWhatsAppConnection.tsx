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
import { useParams } from 'react-router-dom';
import { WhatsAppService } from '../../../services/whatsapp';

interface ConnectionData {
  pairingCode?: string;
  code?: string;
  count?: number;
}

const SalonWhatsAppConnection = () => {
  const { salonId } = useParams();
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);

  useEffect(() => {
    checkStatus();
  }, [salonId]);

  const checkStatus = async () => {
    try {
      const response = await WhatsAppService.getStatus(salonId!, false);
      setStatus(response.status);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setError('Erro ao verificar status da conexão');
    }
  };

  const handleGeneratePairingCode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await WhatsAppService.generateQrCode(salonId!, false);
      setConnectionData(data);
    } catch (error) {
      console.error('Erro ao gerar código:', error);
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
                      Gerando código de pareamento...
                    </Typography>
                  </Box>
                ) : connectionData?.pairingCode ? (
                  <>
                    <Typography variant="h4" sx={{ letterSpacing: 2 }}>
                      {connectionData.pairingCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Abra o WhatsApp no seu celular e digite este código em Configurações {'>'} Dispositivos Conectados
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={handleGeneratePairingCode}
                      sx={{ mt: 2 }}
                    >
                      Gerar Novo Código
                    </Button>
                  </>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 2 
                  }}>
                    <Typography variant="body1" color="text.secondary" align="center">
                      Clique no botão abaixo para gerar um código de pareamento
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleGeneratePairingCode}
                      disabled={isLoading}
                    >
                      Gerar Código de Pareamento
                    </Button>
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