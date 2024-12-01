// src/pages/management/Professionals.tsx
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
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
import { useState, useEffect , ChangeEvent } from 'react';


import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Professional {
  id: number;
  nome: string;
  especialidade: string;
  telefone: string;
  is_active: boolean;
}

const Professionals = () => {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    especialidade: '',
    telefone: ''
  });

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const response = await api.get('/profissionais/');
      setProfessionals(response.data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const handleOpenDialog = (professional?: Professional) => {
    if (professional) {
      setFormData({
        nome: professional.nome,
        especialidade: professional.especialidade,
        telefone: professional.telefone
      });
      setSelectedProfessional(professional);
    } else {
      setFormData({
        nome: '',
        especialidade: '',
        telefone: ''
      });
      setSelectedProfessional(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProfessional(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        nome: formData.nome,
        especialidade: formData.especialidade,
        telefone: formData.telefone,
        estabelecimento: user?.estabelecimento_id,
        is_active: true
      };

      if (selectedProfessional) {
        await api.patch(`/profissionais/${selectedProfessional.id}/`, userData);
      } else {
        await api.post('/profissionais/', userData);
      }
      
      handleCloseDialog();
      loadProfessionals();
    } catch (error: any) {
      console.error('Erro ao salvar profissional:', error);
      setError(error.response?.data?.message || 'Erro ao salvar profissional');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
      try {
        await api.delete(`/profissionais/${id}/`);
        loadProfessionals();
      } catch (error) {
        console.error('Erro ao excluir profissional:', error);
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">
            Profissionais
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Novo Profissional
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Especialidade</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell>{professional.nome}</TableCell>
                  <TableCell>{professional.especialidade}</TableCell>
                  <TableCell>{professional.telefone}</TableCell>
                  <TableCell>
                    <Chip
                      label={professional.is_active ? 'Ativo' : 'Inativo'}
                      color={professional.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(professional)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(professional.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedProfessional ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
          <Box component="form" onSubmit={handleSubmit}>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                fullWidth
                label="Nome"
                value={formData.nome}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nome: e.target.value })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Especialidade"
                value={formData.especialidade}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, especialidade: e.target.value })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Telefone"
                value={formData.telefone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, telefone: e.target.value })}
                required
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancelar</Button>
              <Button 
                type="submit" 
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Professionals;