// frontend/src/pages/professional/History.tsx
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
  Chip,
  Box,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';

interface Appointment {
  id: number;
  cliente: {
    nome: string;
    whatsapp: string;
  };
  servico: {
    nome_servico: string;
  };
  data_agendamento: string;
  horario: string;
  status: string;
}

const History = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.get('/agendamentos/profissional/historico/');
      setAppointments(response.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => 
    appointment.cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
    appointment.servico.nome_servico.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Histórico de Atendimentos
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar por cliente ou serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Serviço</TableCell>
                <TableCell>Horário</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    {format(new Date(appointment.data_agendamento), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{appointment.cliente.nome}</TableCell>
                  <TableCell>{appointment.servico.nome_servico}</TableCell>
                  <TableCell>{appointment.horario}</TableCell>
                  <TableCell>
                    <Chip 
                      label={appointment.status}
                      color={
                        appointment.status === 'concluido' ? 'success' :
                        appointment.status === 'cancelado' ? 'error' :
                        'default'
                      }
                      size="small"
                    />
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

export default History;