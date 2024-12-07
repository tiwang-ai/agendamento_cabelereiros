import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  CircularProgress,
  Button
} from '@mui/material';
import { useState, useEffect } from 'react';

import api from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SystemLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

interface SystemMetrics {
  system: {
    cpu_percent: number;
    memory_percent: number;
    disk_usage: number;
  };
  docker: Array<{
    name: string;
    status: string;
    cpu_usage: number;
    memory_usage: number;
  }>;
  salons: Array<{
    id: number;
    name: string;
    total_interactions: number;
    whatsapp_status: string;
    is_active: boolean;
  }>;
  bot: {
    total_messages: number;
    success_rate: number;
    average_response_time: number;
  };
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
};

const TechSupport = () => {
  const [tabValue, setTabValue] = useState(0);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [logsResponse, metricsResponse] = await Promise.all([
        api.get('/admin/system-logs/'),
        api.get('/admin/system-metrics/')
      ]);
      setSystemLogs(logsResponse.data);
      setMetrics(metricsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Suporte Técnico
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadData}
            disabled={refreshing}
          >
            {refreshing ? <CircularProgress size={24} /> : 'Atualizar'}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Logs do Sistema" />
              <Tab label="Métricas" />
              <Tab label="Status dos Serviços" />
              <Tab label="Problemas Reportados" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ação</TableCell>
                      <TableCell>Usuário</TableCell>
                      <TableCell>Data/Hora</TableCell>
                      <TableCell>Detalhes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {systemLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {metrics && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Recursos do Sistema
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary">CPU</Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={metrics.system.cpu_percent} 
                            />
                            <Typography variant="h5">{metrics.system.cpu_percent}%</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      {/* Similar cards for Memory and Disk */}
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Métricas do Bot
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Card>
                          <CardContent>
                            <Typography color="textSecondary">Total de Mensagens</Typography>
                            <Typography variant="h5">{metrics.bot.total_messages}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      {/* Similar cards for Success Rate and Response Time */}
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Serviço</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Última Verificação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics?.docker.map((container) => (
                      <TableRow key={container.name}>
                        <TableCell>{container.name}</TableCell>
                        <TableCell>{container.status}</TableCell>
                        <TableCell>{new Date().toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              {/* Implementar visualização de problemas reportados */}
            </TabPanel>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default TechSupport;