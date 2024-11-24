// src/pages/calendar/Calendar.tsx
import { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import api from '../../services/api';

interface Appointment {
  id: number;
  cliente: {
    nome: string;
  };
  servico: {
    nome_servico: string;
  };
  data_agendamento: string;
  horario: string;
}

const Calendar = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // Endpoint diferente baseado no papel do usuário
        const endpoint = user?.role === UserRole.PROFESSIONAL 
          ? '/agendamentos/profissional/'
          : '/agendamentos/';
        
        const response = await api.get(endpoint);
        setAppointments(response.data);
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error);
      }
    };

    loadAppointments();
  }, [user?.role]);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          {user?.role === UserRole.PROFESSIONAL ? 'Minha Agenda' : 'Calendário de Agendamentos'}
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <DateCalendar 
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
          />
        </LocalizationProvider>
        
        {/* Exibir agendamentos */}
        <Box sx={{ mt: 3 }}>
          {appointments.map(appointment => (
            <Paper key={appointment.id} sx={{ p: 2, mb: 1 }}>
              <Typography>
                Cliente: {appointment.cliente.nome}
              </Typography>
              <Typography>
                Serviço: {appointment.servico.nome_servico}
              </Typography>
              <Typography>
                Data: {appointment.data_agendamento} às {appointment.horario}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default Calendar;