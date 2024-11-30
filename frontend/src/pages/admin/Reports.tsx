// frontend/src/pages/admin/Reports.tsx
import { useState, ChangeEvent } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  MenuItem,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import api from '../../services/api';

interface AnalyticsData {
  total_agendamentos: number;
  receita_total: number;
  servicos_populares: Array<{
    servico__nome_servico: string;
    total: number;
  }>;
  media_diaria: number;
  taxa_cancelamento: number;
}

const Reports = () => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [reportType, setReportType] = useState('agendamentos');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/reports/analytics/', {
        params: {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd')
        }
      });

      setAnalytics(response.data);
    } catch (err) {
      setError('Erro ao carregar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/reports/export/', {
        params: {
          type: reportType,
          start_date: format(startDate!, 'yyyy-MM-dd'),
          end_date: format(endDate!, 'yyyy-MM-dd')
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_${reportType}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erro ao exportar dados');
      console.error(err);
    }
  };

  const handleStartDateChange = (newValue: Date | null) => {
    setStartDate(newValue);
  };

  const handleEndDateChange = (newValue: Date | null) => {
    setEndDate(newValue);
  };

  const handleReportTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setReportType(e.target.value);
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Relatórios e Análises
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Data Inicial"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Data Final"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Tipo de Relatório"
              value={reportType}
              onChange={handleReportTypeChange}
            >
              <MenuItem value="agendamentos">Agendamentos</MenuItem>
              <MenuItem value="clientes">Clientes</MenuItem>
              <MenuItem value="servicos">Serviços</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            onClick={loadAnalytics}
            disabled={loading || !startDate || !endDate}
            sx={{ mr: 2 }}
          >
            {loading ? 'Carregando...' : 'Gerar Relatório'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleExport}
            disabled={loading || !startDate || !endDate}
          >
            Exportar CSV
          </Button>
        </Box>

        {analytics && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total de Agendamentos
                  </Typography>
                  <Typography variant="h4">
                    {analytics.total_agendamentos}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Receita Total
                  </Typography>
                  <Typography variant="h4">
                    R$ {analytics.receita_total.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Taxa de Cancelamento
                  </Typography>
                  <Typography variant="h4">
                    {analytics.taxa_cancelamento.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Serviços Mais Populares
                  </Typography>
                  <Box sx={{ width: '100%', height: 300 }}>
                    <Box sx={{ width: '100%', height: '100%' }}>
                      {analytics?.servicos_populares && (
                        <BarChart
                          width={500}
                          height={300}
                          data={analytics.servicos_populares}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="servico__nome_servico" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" fill="#8884d8" name="Quantidade" />
                        </BarChart>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default Reports;