// frontend/src/pages/professional/Clients.tsx
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  WhatsApp as WhatsAppIcon,
  History as HistoryIcon
} from '@mui/icons-material';
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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { useState, useEffect , ChangeEvent } from 'react';

import api from '../../services/api';



interface Cliente {
  id: number;
  nome: string;
  whatsapp: string;
  email: string | null;
  data_cadastro: string;
  observacoes: string | null;
  historico_agendamentos: string | null;
  is_active: boolean;
  ultimo_agendamento?: string;
  total_agendamentos?: number;
}

const ProfessionalClients = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    observacoes: ''
  });
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedHistoryClient, setSelectedHistoryClient] = useState<Cliente | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get('/profissional/clientes/');
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (client?: Cliente) => {
    if (client) {
      setFormData({
        nome: client.nome,
        whatsapp: client.whatsapp,
        email: client.email || '',
        observacoes: client.observacoes || ''
      });
      setSelectedClient(client);
    } else {
      setFormData({
        nome: '',
        whatsapp: '',
        email: '',
        observacoes: ''
      });
      setSelectedClient(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedClient) {
        await api.patch(`/profissional/clientes/${selectedClient.id}/`, formData);
      } else {
        await api.post('/profissional/clientes/', formData);
      }
      loadClients();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      setError(error.response?.data?.message || 'Erro ao salvar cliente');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/profissional/clientes/${id}/`);
        loadClients();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        setError('Erro ao excluir cliente');
      }
    }
  };

  const handleWhatsAppClick = (whatsapp: string) => {
    window.open(`https://wa.me/${whatsapp}`, '_blank');
  };

  const handleOpenHistory = (client: Cliente) => {
    setSelectedHistoryClient(client);
    setOpenHistoryDialog(true);
  };

  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(search.toLowerCase()) ||
    client.whatsapp.includes(search) ||
    (client.email && client.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Meus Clientes
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Novo Cliente
              </Button>
            </Box>

            <TextField
              fullWidth
              placeholder="Buscar por nome, telefone ou email..."
              value={search}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>WhatsApp</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Último Agendamento</TableCell>
                    <TableCell>Total Agendamentos</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.nome}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {client.whatsapp}
                          <IconButton
                            size="small"
                            onClick={() => handleWhatsAppClick(client.whatsapp)}
                            color="success"
                          >
                            <WhatsAppIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        {client.ultimo_agendamento ? 
                          format(new Date(client.ultimo_agendamento), 'dd/MM/yyyy') : 
                          'Nenhum'
                        }
                      </TableCell>
                      <TableCell>{client.total_agendamentos || 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={client.is_active ? 'Ativo' : 'Inativo'}
                          color={client.is_active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(client)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(client.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenHistory(client)}
                          color="primary"
                        >
                          <HistoryIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle>
                {selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
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
                    label="WhatsApp"
                    value={formData.whatsapp}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, whatsapp: e.target.value })}
                    required
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Observações"
                    multiline
                    rows={4}
                    value={formData.observacoes}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, observacoes: e.target.value })}
                    margin="normal"
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDialog}>Cancelar</Button>
                  <Button type="submit" variant="contained">
                    Salvar
                  </Button>
                </DialogActions>
              </Box>
            </Dialog>

            <Dialog 
              open={openHistoryDialog} 
              onClose={() => setOpenHistoryDialog(false)}
              maxWidth="md" 
              fullWidth
            >
              <DialogTitle>
                Histórico do Cliente: {selectedHistoryClient?.nome}
              </DialogTitle>
              <DialogContent>
                <Typography variant="subtitle1" gutterBottom>
                  Total de Agendamentos: {selectedHistoryClient?.total_agendamentos || 0}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Último Agendamento: {
                    selectedHistoryClient?.ultimo_agendamento ? 
                    format(new Date(selectedHistoryClient.ultimo_agendamento), 'dd/MM/yyyy') : 
                    'Nenhum'
                  }
                </Typography>
                <Typography variant="body1">
                  Observações: {selectedHistoryClient?.observacoes || 'Nenhuma observação'}
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenHistoryDialog(false)}>
                  Fechar
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ProfessionalClients;