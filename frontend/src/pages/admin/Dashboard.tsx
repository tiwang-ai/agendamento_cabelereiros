// src/pages/admin/Dashboard.tsx
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  useTheme
} from '@mui/material';
import { useState, useEffect } from 'react';

import api from '../../services/api';

interface StatsData {
  totalSalons: number;
  activeSalons: number;
  totalRevenue: number;
  activeSubscriptions: number;
  recentActivities: Activity[];
}

interface Activity {
  id: number;
  type: string;
  description: string;
  date: string;
}

const AdminDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/api/admin/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            backgroundColor: color,
            borderRadius: '50%',
            p: 1,
            mr: 2
          }}>
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrativo
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total de Salões"
            value={stats?.totalSalons}
            icon={<BusinessIcon sx={{ color: 'white' }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Salões Ativos"
            value={stats?.activeSalons}
            icon={<PeopleIcon sx={{ color: 'white' }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Receita Total"
            value={`R$ ${stats?.totalRevenue.toFixed(2)}`}
            icon={<MoneyIcon sx={{ color: 'white' }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assinaturas Ativas"
            value={stats?.activeSubscriptions}
            icon={<TimelineIcon sx={{ color: 'white' }} />}
            color={theme.palette.info.main}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Atividades Recentes
            </Typography>
            {stats?.recentActivities.map((activity) => (
              <Box
                key={activity.id}
                sx={{
                  py: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <Typography>{activity.description}</Typography>
                <Typography color="text.secondary">
                  {new Date(activity.date).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;