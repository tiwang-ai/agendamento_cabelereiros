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
  Tab
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { WhatsAppService } from '../../services/whatsapp';
import { useAuth } from '../../contexts/AuthContext';
import { DataGrid } from '@mui/x-data-grid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.salonId) {
        setError('Salão não encontrado. Por favor, verifique seu cadastro.');
        return;
      }

      try {
        const statusResponse = await WhatsAppService.getStatus(user.salonId);
        setStatus(statusResponse.status);
        
        if (statusResponse.status === 'connecting') {
          const qrResponse = await WhatsAppService.generateQrCode(user.salonId);
          setQrCode(qrResponse.qrCode);
        }
      } catch (err) {
        console.error('Erro ao verificar status:', err);
        setError('Erro ao verificar status do WhatsApp');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [user?.salonId]);

  useEffect(() => {
    const loadLogs = async () => {
      if (user?.salonId) {
        try {
          const logsData = await WhatsAppService.getInstanceLogs(user.salonId);
          setLogs(logsData);
        } catch (err) {
          console.error('Erro ao carregar logs:', err);
        }
      }
    };

    loadLogs();
    const logsInterval = setInterval(loadLogs, 30000);
    return () => clearInterval(logsInterval);
  }, [user?.salonId]);

  const handleConnect = async () => {
    try {
      if (!user?.salonId) {
        setError('ID do salão não encontrado');
        return;
      }

      setStatus('connecting');
      const response = await WhatsAppService.reconnect(user.salonId);
      
      if (response.success) {
        const qrResponse = await WhatsAppService.generateQrCode(user.salonId);
        setQrCode(qrResponse.qrCode);
      }
    } catch (err) {
      setError('Erro ao conectar WhatsApp');
      setStatus('disconnected');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Conexão WhatsApp
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="QR Code" />
          <Tab label="Código" disabled />
          <Tab label="Logs" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {status === 'connected' ? (
              <Alert severity="success">
                WhatsApp conectado ao número {user?.phone || 'Não informado'}!
              </Alert>
            ) : (
              <>
                {qrCode && (
                  <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd' }}>
                    <QRCodeSVG value={qrCode} size={256} />
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary" align="center">
                  Escaneie o QR Code com seu WhatsApp para conectar
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleConnect}
                  disabled={status === 'connecting'}
                >
                  {status === 'connecting' ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Gerar QR Code'
                  )}
                </Button>
              </>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Conexão por código temporariamente indisponível
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Logs de Conexão
          </Typography>
          <DataGrid
            rows={logs}
            columns={[
              { field: 'timestamp', headerName: 'Data/Hora', width: 200 },
              { field: 'event', headerName: 'Evento', width: 200 },
              { field: 'status', headerName: 'Status', width: 150 },
              { field: 'details', headerName: 'Detalhes', width: 400 }
            ]}
            autoHeight
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
          />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default WhatsAppConnection;