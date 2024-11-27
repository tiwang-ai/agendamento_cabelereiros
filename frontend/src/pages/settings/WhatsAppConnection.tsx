// frontend/src/pages/settings/WhatsAppConnection.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Fade
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { WhatsAppService } from '../../services/whatsapp';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface PairingCode {
  pairingCode: string;
  code: string;
  count: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const WhatsAppConnection = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pairingCode, setPairingCode] = useState<PairingCode | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'connecting') {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const checkStatus = async () => {
    if (!user?.estabelecimento_id) return;

    try {
      const statusResponse = await WhatsAppService.checkConnectionStatus(
        user.estabelecimento_id
      );
      
      if (statusResponse.status === 'connected') {
        setStatus('connected');
        loadLogs();
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
  };

  const loadLogs = async () => {
    if (!user?.estabelecimento_id) return;

    try {
      const logsResponse = await WhatsAppService.getInstanceLogs(
        user.estabelecimento_id
      );
      setLogs(logsResponse.logs || []);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    }
  };

  const getQRCode = async () => {
    if (!user?.estabelecimento_id) {
      setError('ID do salão não encontrado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const qrResponse = await WhatsAppService.generateQrCode(user.estabelecimento_id);
      
      if (qrResponse.code) {
        setQrCode(qrResponse.code);
        setStatus('connecting');
      } else {
        throw new Error('QR Code não recebido');
      }
    } catch (err) {
      console.error('Erro ao gerar QR code:', err);
      setError('Não foi possível gerar o QR code. Por favor, tente novamente.');
      setStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetPairingCode = async () => {
    if (!user?.estabelecimento_id) {
      setError('ID do salão não encontrado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await WhatsAppService.generatePairingCode(user.estabelecimento_id);
      setPairingCode(response);
    } catch (err) {
      setError('Erro ao gerar código de pareamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Conexão WhatsApp
        </Typography>

        {error && (
          <Fade in={true}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Fade>
        )}

        {status === 'connected' && (
          <Fade in={true}>
            <Alert severity="success" sx={{ mb: 2 }}>
              WhatsApp conectado com sucesso!
            </Alert>
          </Fade>
        )}

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="QR Code" />
          <Tab label="Código" disabled />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: 2,
            minHeight: 400 
          }}>
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
                  Gerando QR Code...
                </Typography>
              </Box>
            ) : (
              <Fade in={true}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 3 
                }}>
                  {qrCode ? (
                    <>
                      <Box sx={{ 
                        p: 3, 
                        border: '1px solid #ddd', 
                        borderRadius: 2,
                        bgcolor: '#fff',
                        boxShadow: 1
                      }}>
                        <QRCodeSVG value={qrCode} size={256} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Abra o WhatsApp no seu celular e escaneie o QR Code
                      </Typography>
                      <Button
                        variant="outlined"
                        onClick={getQRCode}
                        sx={{ mt: 2 }}
                      >
                        Gerar Novo QR Code
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={getQRCode}
                      disabled={isLoading}
                      sx={{ mt: 4 }}
                    >
                      Gerar QR Code
                    </Button>
                  )}
                </Box>
              </Fade>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {pairingCode ? (
              <>
                <Typography variant="h4" sx={{ letterSpacing: 2 }}>
                  {pairingCode.pairingCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Digite este código no seu WhatsApp para conectar
                </Typography>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleGetPairingCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Gerar Código de Pareamento'
                )}
              </Button>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default WhatsAppConnection;