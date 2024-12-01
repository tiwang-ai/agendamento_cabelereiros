// frontend/src/pages/professional/Agenda.tsx
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import ptBR, { format } from 'date-fns';
import { useState, useEffect } from 'react';

import api from '../../services/api';

interface Appointment {
  id: number;
  cliente: {
    id: number;
    nome: string;
    whatsapp: string;
  };
  servico: {
    nome_servico: string;
    duracao: number;
  };
  data_agendamento: string;
  horario: string;
  status: string;
}

const Agenda = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.get('/agendamentos/profissional/');
      setAppointments(response.data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseDialog = () => {
    setSelectedAppointment(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedAppointment) return;

    try {
      await api.patch(`/agendamentos/${selectedAppointment.id}/`, {
        status: newStatus
      });
      loadAppointments();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
      'pendente': 'warning',
      'confirmado': 'success',
      'cancelado': 'error',
      'concluido': 'default'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography>Carregando...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Minha Agenda
        </Typography>

        <Grid container spacing={3}>
          {appointments.map((appointment) => (
            <Grid item xs={12} md={6} key={appointment.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-2px)' },
                  transition: '0.3s'
                }}
                onClick={() => handleAppointmentClick(appointment)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      {appointment.cliente.nome}
                    </Typography>
                    <Chip 
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EventIcon color="action" />
                    <Typography>
                      {format(new Date(appointment.data_agendamento), "dd 'de' MMMM", { locale: ptBR })}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TimeIcon color="action" />
                    <Typography>
                      {appointment.horario}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="action" />
                    <Typography>
                      {appointment.servico.nome_servico}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={!!selectedAppointment} onClose={handleCloseDialog}>
          <DialogTitle>
            Detalhes do Agendamento
          </DialogTitle>
          <DialogContent>
            {selectedAppointment && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedAppointment.cliente.nome}
                </Typography>
                <Typography gutterBottom>
                  Serviço: {selectedAppointment.servico.nome_servico}
                </Typography>
                <Typography gutterBottom>
                  Data: {format(new Date(selectedAppointment.data_agendamento), "dd/MM/yyyy")}
                </Typography>
                <Typography gutterBottom>
                  Horário: {selectedAppointment.horario}
                </Typography>
                <Typography gutterBottom>
                  WhatsApp: {selectedAppointment.cliente.whatsapp}
                </Typography>
                <Typography gutterBottom>
                  Duração: {selectedAppointment.servico.duracao} minutos
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Fechar
            </Button>
            {selectedAppointment?.status === 'pendente' && (
              <>
                <Button 
                  onClick={() => handleStatusChange('confirmado')}
                  color="success"
                >
                  Confirmar
                </Button>
                <Button 
                  onClick={() => handleStatusChange('cancelado')}
                  color="error"
                >
                  Cancelar
                </Button>
              </>
            )}
            {selectedAppointment?.status === 'confirmado' && (
              <Button 
                onClick={() => handleStatusChange('concluido')}
                color="primary"
              >
                Marcar como Concluído
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Agenda;