// frontend/src/pages/management/Clients.tsx
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  WhatsApp as WhatsAppIcon,
  History as HistoryIcon,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { format } from 'date-fns';
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

import api from '../../services/api';


interface Professional {
  id: number;
  nome: string;
  especialidade: string;
}

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
  profissional_responsavel?: Professional;
}

const Clients = () => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    observacoes: '',
    profissional_id: ''
  });
  const [selectedHistoryClient, setSelectedHistoryClient] = useState<Cliente | null>(null);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [userEstabelecimento, setUserEstabelecimento] = useState<number | null>(null);

  useEffect(() => {
    loadClients();
    loadProfessionals();
  }, []);

  useEffect(() => {
    const loadUserEstablishment = async () => {
        try {
            const response = await api.get('/api/dashboard/stats/');
            setUserEstabelecimento(response.data.estabelecimento_id);
        } catch (error: any) {
            console.error('Erro ao carregar estabelecimento:', error);
        }
    };

    loadUserEstablishment();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get('/api/clientes/');
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const loadProfessionals = async () => {
    try {
      const response = await api.get('/api/profissionais/');
      setProfessionals(response.data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const handleOpenDialog = (client?: Cliente) => {
    if (client) {
      setFormData({
        nome: client.nome,
        whatsapp: client.whatsapp,
        email: client.email || '',
        observacoes: client.observacoes || '',
        profissional_id: client.profissional_responsavel?.id?.toString() || ''
      });
      setSelectedClient(client);
    } else {
      setFormData({
        nome: '',
        whatsapp: '',
        email: '',
        observacoes: '',
        profissional_id: ''
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userEstabelecimento) {
      setError('Estabelecimento não encontrado');
      return;
    }

    try {
      const clientData = {
        nome: formData.nome,
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        email: formData.email || null,
        observacoes: formData.observacoes || null,
        is_active: true,
        estabelecimento: userEstabelecimento
      };

      if (selectedClient) {
        await api.patch(`/api/clientes/${selectedClient.id}/`, clientData);
      } else {
        await api.post('/api/clientes/', clientData);
      }
      loadClients();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      if (error.response?.status === 500) {
        setError('Erro interno do servidor. Verifique se todos os campos estão preenchidos corretamente.');
      } else {
        setError(error.response?.data?.detail || 'Erro ao salvar cliente');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/api/clientes/${id}/`);
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

  const filteredClients = clients.filter(client =>
    client.nome.toLowerCase().includes(search.toLowerCase()) ||
    client.whatsapp.includes(search) ||
    (client.email && client.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenHistory = (client: Cliente) => {
    setSelectedHistoryClient(client);
    setOpenHistoryDialog(true);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, nome: e.target.value });
  };

  const handleWhatsAppChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, whatsapp: e.target.value });
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handleProfissionalChange = (e: SelectChangeEvent<string>) => {
    setFormData({ ...formData, profissional_id: e.target.value });
  };

  const handleObservacoesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, observacoes: e.target.value });
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
                Gerenciamento de Clientes
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
              onChange={handleSearchChange}
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
                    <TableCell>Profissional Responsável</TableCell>
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
                        {client.profissional_responsavel?.nome || 'Não atribuído'}
                      </TableCell>
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
                    onChange={handleNameChange}
                    required
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="WhatsApp"
                    value={formData.whatsapp}
                    onChange={handleWhatsAppChange}
                    required
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleEmailChange}
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Profissional Responsável</InputLabel>
                    <Select
                      value={formData.profissional_id}
                      onChange={handleProfissionalChange}
                      label="Profissional Responsável"
                    >
                      <MenuItem value="">
                        <Typography variant="body2" color="textSecondary">
                          Nenhum
                        </Typography>
                      </MenuItem>
                      {professionals.map((prof) => (
                        <MenuItem key={prof.id} value={prof.id}>
                          {prof.nome} - {prof.especialidade}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Observações"
                    multiline
                    rows={4}
                    value={formData.observacoes}
                    onChange={handleObservacoesChange}
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

export default Clients;