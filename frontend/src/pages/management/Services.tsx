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
  InputAdornment
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
  systemServiceId: number;
  salonId: number;
  duration?: number;
  price?: number;
  active: boolean;
}

const ServicesManagement = () => {
  const [systemServices, setSystemServices] = useState<SystemService[]>([]);
  const [salonServices, setSalonServices] = useState<SalonService[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<SystemService | null>(null);
  const [formData, setFormData] = useState({
    nome_servico: '',
    duracao: '',
    preco: ''
  });
  const currentSalonId = useAuth().user?.salonId;

  useEffect(() => {
    loadSystemServices();
    loadSalonServices();
  }, []);

  const loadSystemServices = async () => {
    try {
      const response = await api.get('/system-services/');
      setSystemServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços do sistema:', error);
    }
  };

  const loadSalonServices = async () => {
    try {
      const response = await api.get('/salon-services/');
      setSalonServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços do salão:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        duracao: parseInt(formData.duracao),
        preco: parseFloat(formData.preco)
      };

      if (selectedService) {
        await api.put(`/servicos/${selectedService.id}/`, data);
      } else {
        await api.post('/servicos/', data);
      }
      loadSystemServices();
      loadSalonServices();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await api.delete(`/servicos/${id}/`);
        loadSystemServices();
        loadSalonServices();
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
      }
    }
  };

  const handleOpenDialog = (service?: SystemService) => {
    if (service) {
      setSelectedService(service);
      setFormData({
        nome_servico: service.name,
        duracao: service.defaultDuration?.toString() || '',
        preco: service.defaultPrice?.toString() || ''
      });
    } else {
      setSelectedService(null);
      setFormData({ nome_servico: '', duracao: '', preco: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedService(null);
    setFormData({ nome_servico: '', duracao: '', preco: '' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Gerenciamento de Serviços
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={() => handleOpenDialog()}
          sx={{ mb: 3 }}
        >
          Adicionar Serviço
        </Button>

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
              {systemServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.defaultDuration} min</TableCell>
                  <TableCell>R$ {service.defaultPrice?.toFixed(2) || '0.00'}</TableCell>
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
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nome do Serviço"
              fullWidth
              value={formData.nome_servico}
              onChange={(e) => setFormData({ ...formData, nome_servico: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Duração (minutos)"
              fullWidth
              type="number"
              value={formData.duracao}
              onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Preço"
              fullWidth
              type="number"
              value={formData.preco}
              onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default ServicesManagement;