import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  CircularProgress
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

import { WhatsAppService } from '../../services/whatsapp';

interface SalonStatus {
  id: string;
  nome: string;
  instance_id: string;
  whatsapp: string;
  status: string;
}

interface ConnectionData {
  pairingCode?: string;
  code?: string;
  count?: number;
}

const WhatsAppStatus = () => {
  const [instances, setInstances] = useState<SalonStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);

  const loadInstances = async () => {
    try {
      const response = await WhatsAppService.getAllInstances();
      setInstances(response);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
    }
  };

  const handleReconnect = async (estabelecimentoId: string) => {
    try {
      setLoading(true);
      const response = await WhatsAppService.connect(estabelecimentoId);
      
      if (response.success) {
        await loadInstances();
        
        if (response.connection_data) {
          setConnectionData(response.connection_data);
          setOpenQRDialog(true);
        }
      }
    } catch (error) {
      console.error('Erro ao reconectar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenQRDialog(false);
    setConnectionData(null);
  };

  useEffect(() => {
    loadInstances();
    const interval = setInterval(loadInstances, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Status das Instâncias WhatsApp</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Salão</TableCell>
                <TableCell>WhatsApp</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {instances.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell>{instance.nome}</TableCell>
                  <TableCell>{instance.whatsapp}</TableCell>
                  <TableCell>
                    <Chip 
                      label={instance.status}
                      color={instance.status === 'connected' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    {instance.status !== 'connected' && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleReconnect(instance.id)}
                        disabled={loading}
                      >
                        Reconectar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Dialog 
          open={openQRDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Conectar WhatsApp
          </DialogTitle>
          <DialogContent>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 3,
              p: 3
            }}>
              {loading ? (
                <CircularProgress />
              ) : connectionData ? (
                <>
                  {connectionData.code ? (
                    <>
                      <Box sx={{ 
                        p: 3, 
                        border: '1px solid #ddd', 
                        borderRadius: 2,
                        bgcolor: '#fff',
                        boxShadow: 1
                      }}>
                        <Box
                          component={QRCodeSVG}
                          value={connectionData.code}
                          size={256}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Abra o WhatsApp no seu celular e escaneie o QR Code
                      </Typography>
                    </>
                  ) : connectionData.pairingCode ? (
                    <>
                      <Typography variant="h4" sx={{ letterSpacing: 2 }}>
                        {connectionData.pairingCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Digite este código no seu WhatsApp para conectar
                      </Typography>
                    </>
                  ) : (
                    <Typography color="error">
                      Erro ao gerar código de conexão
                    </Typography>
                  )}
                </>
              ) : null}
            </Box>
          </DialogContent>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default WhatsAppStatus;