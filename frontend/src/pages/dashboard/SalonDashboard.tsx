// src/pages/dashboard/SalonDashboard.tsx
import {
  Person as PersonIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  useTheme,
  CircularProgress
} from '@mui/material';
import { useState, useEffect } from 'react';

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

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const SalonDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, appointmentsResponse] = await Promise.all([
          api.get('/api/dashboard/stats/'),
          api.get('/api/agendamentos/')
        ]);
        
        setStats({
          clientesHoje: statsResponse.data.clientesHoje || 0,
          agendamentosHoje: statsResponse.data.agendamentosHoje || 0,
          faturamentoHoje: statsResponse.data.faturamentoHoje || 0,
          clientesTotal: statsResponse.data.clientesTotal || 0
        });
        setAppointments(appointmentsResponse.data);
      } catch (error: any) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleEditAppointment = async (id: string) => {
    try {
      // Implementar edição de agendamento
      await api.put(`/api/agendamentos/${id}/`);
    } catch (error) {
      console.error('Erro ao editar agendamento:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await api.delete(`/api/agendamentos/${id}/`);
      } catch (error) {
        console.error('Erro ao excluir agendamento:', error);
      }
    }
  };

  const StatsCard = ({ title, value, icon, color }: StatsCardProps) => (
    <Card 
      elevation={2}
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
        color: 'white',
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <IconButton 
            sx={{ 
              color: 'white', 
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            {icon}
          </IconButton>
        </Box>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
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

export default SalonDashboard;