import React, { useState, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import { WhatsAppService } from '../../services/whatsapp';

interface SalonStatus {
  id: string;
  nome: string;
  instance_id: string;
  whatsapp: string;
  status: string;
}

const WhatsAppStatus = () => {
  const [instances, setInstances] = useState<SalonStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInstances = async () => {
    try {
      const response = await WhatsAppService.getAllInstances();
      setInstances(response);
    } catch (error) {
      console.error('Erro ao carregar instâncias:', error);
    }
  };

  const handleReconnect = async (salonId: string) => {
    try {
      setLoading(true);
      await WhatsAppService.reconnect(salonId);
      await loadInstances();
    } catch (error) {
      console.error('Erro ao reconectar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
    const interval = setInterval(loadInstances, 30000); // Atualiza a cada 30s
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
      </Paper>
    </Container>
  );
};

export default WhatsAppStatus;