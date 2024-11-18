// src/pages/admin/Salons.tsx
import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import api from '../../services/api';

interface Salon {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
  horario_funcionamento: string;
  status: 'active' | 'inactive' | 'pending';
}

const SalonsManagement = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  useEffect(() => {
    loadSalons();
  }, []);

  const loadSalons = async () => {
    try {
      const response = await api.get('/api/estabelecimentos/');
      setSalons(response.data);
    } catch (error) {
      console.error('Erro ao carregar salões:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (salonId: number, newStatus: string) => {
    try {
      await api.patch(`/api/estabelecimentos/${salonId}/`, {
        status: newStatus
      });
      loadSalons();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este salão?')) {
      try {
        await api.delete(`/api/estabelecimentos/${id}/`);
        loadSalons();
      } catch (error) {
        console.error('Erro ao excluir salão:', error);
      }
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      active: { color: 'success', label: 'Ativo' },
      inactive: { color: 'error', label: 'Inativo' },
      pending: { color: 'warning', label: 'Pendente' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <Chip 
        label={config.label}
        color={config.color as any}
        size="small"
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">
            Gerenciamento de Salões
          </Typography>
          <Button 
            variant="contained"
            onClick={() => setOpenDialog(true)}
          >
            Adicionar Salão
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Endereço</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>WhatsApp</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salons.map((salon) => (
                <TableRow key={salon.id}>
                  <TableCell>{salon.nome}</TableCell>
                  <TableCell>{salon.endereco}</TableCell>
                  <TableCell>{salon.telefone}</TableCell>
                  <TableCell>{salon.whatsapp}</TableCell>
                  <TableCell>
                    {getStatusChip(salon.status)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => window.location.href = `/admin/salons/${salon.id}`}>
                      <ViewIcon />
                    </IconButton>
                    <IconButton onClick={() => {
                      setSelectedSalon(salon);
                      setOpenDialog(true);
                    }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(salon.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedSalon ? 'Editar Salão' : 'Novo Salão'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
              <TextField
                fullWidth
                label="Nome do Salão"
                name="nome"
                value={selectedSalon?.nome || ''}
              />
              <TextField
                fullWidth
                label="Endereço"
                name="endereco"
                value={selectedSalon?.endereco || ''}
              />
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={selectedSalon?.telefone || ''}
              />
              <TextField
                fullWidth
                label="WhatsApp"
                name="whatsapp"
                value={selectedSalon?.whatsapp || ''}
              />
              <TextField
                fullWidth
                label="Horário de Funcionamento"
                name="horario_funcionamento"
                value={selectedSalon?.horario_funcionamento || ''}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={() => {
              // Implementar lógica de salvar
              setOpenDialog(false);
            }}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default SalonsManagement;