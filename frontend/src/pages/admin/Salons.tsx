// src/pages/admin/Salons.tsx
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
  Box,
  Chip,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { SalonService } from '../../services/salons';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { WhatsAppService } from '../../services/whatsapp';

interface Salon {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
  horario_funcionamento: string;
  status: string;
}

const SalonsManagement = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    whatsapp: '',
    horario_funcionamento: ''
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSalons();
  }, []);

  const loadSalons = async () => {
    try {
      const data = await SalonService.getAll();
      setSalons(data);
    } catch (error) {
      console.error('Erro ao carregar salões:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenDialog = (salon?: any) => {
    if (salon) {
      setSelectedSalon(salon);
      setFormData({
        nome: salon.nome,
        endereco: salon.endereco,
        telefone: salon.telefone,
        whatsapp: salon.whatsapp,
        horario_funcionamento: salon.horario_funcionamento
      });
    } else {
      setSelectedSalon(null);
      setFormData({
        nome: '',
        endereco: '',
        telefone: '',
        whatsapp: '',
        horario_funcionamento: ''
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const response = await SalonService.create(formData);
      setSalons([...salons, response]);
      setOpenDialog(false);
      setFormData({
        nome: '',
        endereco: '',
        telefone: '',
        whatsapp: '',
        horario_funcionamento: ''
      });
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar salão');
      console.error('Erro ao salvar salão:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este salão?')) {
      try {
        setError(null);
        await SalonService.delete(id.toString());
        setSalons(salons.filter(salon => salon.id !== id));
      } catch (error: any) {
        setError(error.response?.data?.error || 'Erro ao excluir salão');
        console.error('Erro ao excluir salão:', error);
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
            Gerenciamento de Salões
          </Typography>
          <Button 
            variant="contained"
            onClick={() => handleOpenDialog()}
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
                  <TableCell>
                    <Link 
                      to={`/admin/salons/${salon.id}`}
                      style={{ 
                        textDecoration: 'none', 
                        color: 'primary.main',
                        '&:hover': { textDecoration: 'underline' }
                      } as React.CSSProperties}
                    >
                      {salon.nome}
                    </Link>
                  </TableCell>
                  <TableCell>{salon.endereco}</TableCell>
                  <TableCell>{salon.telefone}</TableCell>
                  <TableCell>{salon.whatsapp}</TableCell>
                  <TableCell>
                    <Chip 
                      label={salon.status || 'Desconectado'}
                      color={salon.status === 'connected' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(salon)}>
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
          maxWidth="sm"
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
                value={formData.nome}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="Endereço"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="WhatsApp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
              />
              <TextField
                fullWidth
                label="Horário de Funcionamento"
                name="horario_funcionamento"
                value={formData.horario_funcionamento}
                onChange={handleInputChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default SalonsManagement;