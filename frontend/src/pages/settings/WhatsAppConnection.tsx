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

interface ConnectionData {
  pairingCode?: string;
  code?: string;
  count?: number;
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
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);

  useEffect(() => {
    const checkInitialStatus = async () => {
      if (!user?.estabelecimento_id) return;
      
      try {
        const statusResponse = await WhatsAppService.getStatus(user.estabelecimento_id);
        setStatus(statusResponse.status);
      } catch (err) {
        console.error('Erro ao verificar status inicial:', err);
      }
    };

    checkInitialStatus();
  }, [user?.estabelecimento_id]);

  const handleGeneratePairingCode = async () => {
    if (!user?.estabelecimento_id) {
      setError('ID do salão não encontrado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await WhatsAppService.connectInstance(user.estabelecimento_id);
      
      if (response.pairingCode || response.code) {
        setConnectionData(response);
      } else {
        throw new Error('Dados de conexão não recebidos');
      }
    } catch (err) {
      console.error('Erro ao gerar código:', err);
      setError('Não foi possível gerar o código. Por favor, tente novamente.');
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
          <Tab label="Código" />
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
                  {connectionData?.code ? (
                    <>
                      <Box sx={{ 
                        p: 3, 
                        border: '1px solid #ddd', 
                        borderRadius: 2,
                        bgcolor: '#fff',
                        boxShadow: 1
                      }}>
                        <QRCodeSVG value={connectionData.code} size={256} />
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
                      Gerar QR Code
                    </Button>
                  )}
                </Box>
              </Fade>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ 
            p: 2, 
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
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default WhatsAppConnection;