// src/pages/calendar/Calendar.tsx
import { 
    Container, 
    Paper, 
    Typography, 
    Box, 
    Button, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert
} from '@mui/material';
import { LocalizationProvider, DateCalendar, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { UserRole } from '../../types/auth';

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

interface AppointmentFormData {
    cliente_id: string;
    profissional_id: string;
    servico_id: string;
    data_agendamento: Date;
    horario: string;
    observacoes: string;
}

const Calendar = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState<AppointmentFormData>({
        cliente_id: '',
        profissional_id: '',
        servico_id: '',
        data_agendamento: new Date(),
        horario: '',
        observacoes: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    const loadAppointments = async (date: Date) => {
        try {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const response = await api.get('/api/agendamentos/calendario/', {
                params: { data: formattedDate }
            });
            setAppointments(response.data);
        } catch (error) {
            console.error('Erro ao carregar agendamentos:', error);
            setError('Erro ao carregar agendamentos');
        }
    };

    const checkAvailability = async () => {
        try {
            const response = await api.get('/api/agendamentos/disponibilidade/', {
                params: {
                    data: format(formData.data_agendamento, 'yyyy-MM-dd'),
                    profissional_id: formData.profissional_id
                }
            });
            setAvailableSlots(response.data.horarios_disponiveis);
        } catch (error) {
            console.error('Erro ao verificar disponibilidade:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await api.post('/api/agendamentos/', formData);
            loadAppointments(selectedDate);
            setOpenDialog(false);
        } catch (error) {
            console.error('Erro ao criar agendamento:', error);
            setError('Erro ao criar agendamento');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments(selectedDate);
    }, [selectedDate]);

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 3, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5">Calendário de Agendamentos</Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => setOpenDialog(true)}
                    >
                        Novo Agendamento
                    </Button>
                </Box>

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

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                    <DialogContent>
                        {/* Formulário de Agendamento */}
                        {/* Adicione os campos necessários aqui */}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                        <Button 
                            onClick={handleSubmit} 
                            variant="contained"
                            disabled={loading}
                        >
                            Salvar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
};

export default Calendar;