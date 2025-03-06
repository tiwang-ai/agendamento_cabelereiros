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
import { StaffService } from '../../services/staff';

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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const AdminDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await StaffService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color }: StatCardProps) => (
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
            value={stats?.totalSalons || 0}
            icon={<BusinessIcon sx={{ color: 'white' }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Salões Ativos"
            value={stats?.activeSalons || 0}
            icon={<PeopleIcon sx={{ color: 'white' }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Receita Total"
            value={`R$ ${(stats?.totalRevenue || 0).toFixed(2)}`}
            icon={<MoneyIcon sx={{ color: 'white' }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assinaturas Ativas"
            value={stats?.activeSubscriptions || 0}
            icon={<TimelineIcon sx={{ color: 'white' }} />}
            color={theme.palette.info.main}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Atividades Recentes
            </Typography>
            {stats?.recentActivities?.map((activity: Activity) => (
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