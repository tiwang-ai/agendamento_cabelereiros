// src/pages/dashboard/SalonDashboard.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Person as PersonIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import AppointmentsTable from '../../components/AppointmentsTable';
import api from '../../services/api';

interface DashboardStats {
  clientesHoje: number;
  agendamentosHoje: number;
  faturamentoHoje: number;
  clientesTotal: number;
}

interface Appointment {
  id: string;
  cliente: {
    nome: string;
  };
  servico: {
    nome_servico: string;
  };
  data_agendamento: string;
  horario: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const SalonDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Carregar estatísticas
      const statsResponse = await api.get('/dashboard/stats/');
      setStats(statsResponse.data);

      // Carregar agendamentos
      const appointmentsResponse = await api.get('/agendamentos/');
      setAppointments(appointmentsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAppointment = async (id: string) => {
    try {
      // Implementar edição de agendamento
      await api.put(`/agendamentos/${id}/`);
      loadDashboardData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao editar agendamento:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await api.delete(`/agendamentos/${id}/`);
        loadDashboardData(); // Recarregar dados
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
      }
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, color: theme.palette.text.primary }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Clientes Hoje"
            value={stats?.clientesHoje || 0}
            icon={<PersonIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Agendamentos"
            value={stats?.agendamentosHoje || 0}
            icon={<EventIcon />}
            color="#FF4081"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Faturamento"
            value={`R$ ${(stats?.faturamentoHoje || 0).toFixed(2)}`}
            icon={<MoneyIcon />}
            color="#00C853"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Clientes"
            value={stats?.clientesTotal || 0}
            icon={<PersonIcon />}
            color="#FF6E40"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Próximos Agendamentos
            </Typography>
            <AppointmentsTable
              appointments={appointments}
              onEdit={handleEditAppointment}
              onDelete={handleDeleteAppointment}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const StatsCard = ({ title, value, icon, color }: any) => (
  <Card sx={{ 
    height: '100%',
    background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
    color: 'white'
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }}>
          {icon}
        </IconButton>
      </Box>
      <Typography variant="h4" sx={{ mb: 1 }}>{value}</Typography>
      <Typography variant="body2" sx={{ opacity: 0.8 }}>{title}</Typography>
    </CardContent>
  </Card>
);

export default SalonDashboard;