// src/pages/management/Professionals.tsx
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
  TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../services/api';

interface Professional {
  id: number;
  name: string;
  specialty: string;
  phone: string;
}

const ProfessionalsManagement = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    phone: ''
  });

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    try {
      const response = await api.get('/api/profissionais/');
      setProfessionals(response.data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedProfessional) {
        await api.put(`/api/profissionais/${selectedProfessional.id}/`, formData);
      } else {
        await api.post('/api/profissionais/', formData);
      }
      loadProfessionals();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este profissional?')) {
      try {
        await api.delete(`/api/profissionais/${id}/`);
        loadProfessionals();
      } catch (error) {
        console.error('Erro ao excluir profissional:', error);
      }
    }
  };

  const handleOpenDialog = (professional?: Professional) => {
    if (professional) {
      setSelectedProfessional(professional);
      setFormData({
        name: professional.name,
        specialty: professional.specialty,
        phone: professional.phone
      });
    } else {
      setSelectedProfessional(null);
      setFormData({ name: '', specialty: '', phone: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProfessional(null);
    setFormData({ name: '', specialty: '', phone: '' });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Gerenciamento de Profissionais
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={() => handleOpenDialog()}
          sx={{ mb: 3 }}
        >
          Adicionar Profissional
        </Button>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Especialidade</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {professionals.map((professional) => (
                <TableRow key={professional.id}>
                  <TableCell>{professional.name}</TableCell>
                  <TableCell>{professional.specialty}</TableCell>
                  <TableCell>{professional.phone}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(professional)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(professional.id)}>
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
            {selectedProfessional ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nome"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Especialidade"
              fullWidth
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Telefone"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

export default ProfessionalsManagement;