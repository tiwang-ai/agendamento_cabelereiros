// src/pages/management/Services.tsx
import { useState, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface SystemService {
  id: number;
  name: string;
  defaultDuration?: number;
  defaultPrice?: number;
}

interface SalonService {
  id: number;
  nome_servico: string;
  duracao: number;
  preco: string | number;
}

const ServicesManagement = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<SalonService[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<SalonService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome_servico: '',
    duracao: '',
    preco: ''
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/servicos/');
      setServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      setError('Erro ao carregar serviços do sistema');
    }
  };

  const handleOpenDialog = (service?: SalonService) => {
    if (service) {
      setFormData({
        nome_servico: service.nome_servico,
        duracao: service.duracao.toString(),
        preco: service.preco.toString()
      });
      setSelectedService(service);
    } else {
      setFormData({
        nome_servico: '',
        duracao: '',
        preco: ''
      });
      setSelectedService(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedService(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const serviceData = {
        nome_servico: formData.nome_servico,
        duracao: parseInt(formData.duracao),
        preco: parseFloat(formData.preco)
      };

      if (selectedService) {
        await api.patch(`/servicos/${selectedService.id}/`, serviceData);
      } else {
        await api.post('/servicos/', serviceData);
      }
      loadServices();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Erro ao salvar serviço:', error);
      setError(error.response?.data?.message || 'Erro ao salvar serviço');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await api.delete(`/servicos/${id}/`);
        loadServices();
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        setError('Erro ao excluir serviço');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">
            Gerenciamento de Serviços
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleOpenDialog()}
          >
            Adicionar Serviço
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome do Serviço</TableCell>
                <TableCell>Duração (min)</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.nome_servico}</TableCell>
                  <TableCell>{service.duracao} min</TableCell>
                  <TableCell>
                    R$ {typeof service.preco === 'number' 
                      ? service.preco.toFixed(2) 
                      : parseFloat(service.preco).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(service)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(service.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>
            {selectedService ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Nome do Serviço"
                fullWidth
                value={formData.nome_servico}
                onChange={(e) => setFormData({ ...formData, nome_servico: e.target.value })}
                required
              />
              <TextField
                margin="dense"
                label="Duração (minutos)"
                fullWidth
                type="number"
                value={formData.duracao}
                onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                required
              />
              <TextField
                margin="dense"
                label="Preço"
                fullWidth
                type="number"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button type="submit" variant="contained">
                Salvar
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default ServicesManagement;