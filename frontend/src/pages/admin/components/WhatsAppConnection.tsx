// frontend/src/pages/settings/WhatsAppConnection.tsx
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
import React, { useState, useEffect, ReactElement } from 'react';

import { useAuth } from '../../../contexts/AuthContext';
import { StaffBotService } from '../../../services/botConfig';

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

interface WhatsAppConnectionProps {
    isSupport?: boolean;
    title?: string;
    salonId?: string;
}

const TabPanel = (props: TabPanelProps): ReactElement => {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
};

const WhatsAppConnection = ({ 
    isSupport = false, 
    title = "Conexão WhatsApp",
    salonId 
}: WhatsAppConnectionProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [hasInstance, setHasInstance] = useState<boolean>(false);

  const currentSalonId = salonId || user?.estabelecimento_id;

  useEffect(() => {
    const checkInstance = async () => {
        try {
          const instanceData = await StaffBotService.checkExistingInstance();
            
          if (instanceData.exists) {
              setStatus(instanceData.state);
              setHasInstance(true);
              
              if (instanceData.state === 'disconnected') {
                  setConnectionData(null);
              }
          }
        } catch (err) {
            console.error('Erro ao verificar instância:', err);
            setError('Erro ao verificar status da conexão');
        }
    };

    checkInstance();
  }, []);

  const handleGeneratePairingCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const qrData = await StaffBotService.generateQrCode();
      
      if (qrData.code && !qrData.code.startsWith('data:image')) {
        qrData.code = `data:image/png;base64,${qrData.code}`;
      }
      
      setConnectionData(qrData);
      setStatus('connecting');
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      setError('Erro ao gerar QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {title}
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

        <Box>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="QR Code" />
            <Tab label="Código" />
          </Tabs>

          <Box role="tabpanel" hidden={tabValue !== 0}>
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
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
                          Gerar QR Code
                        </Button>
                      )}
                    </Box>
                  </Fade>
                )}
              </Box>
            )}
          </Box>

          <Box role="tabpanel" hidden={tabValue !== 1}>
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
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

export default WhatsAppConnection;