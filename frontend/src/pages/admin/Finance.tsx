// src/pages/admin/Finance.tsx
import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { FinanceService } from '../../services/finance';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'cancelled';
  category: string;
  salon_id?: number;
}

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  activeSubscriptions: number;
}

const Finance = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date()
  });
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    category: 'all'
  });

  useEffect(() => {
    loadFinanceData();
  }, [dateRange, filters]);

  const loadFinanceData = async () => {
    try {
      const [statsRes, transactionsRes] = await Promise.all([
        FinanceService.getAdminStats(),
        FinanceService.getAdminTransactions({
          start_date: dateRange.start.toISOString(),
          end_date: dateRange.end.toISOString(),
          type: filters.type !== 'all' ? filters.type : undefined,
          status: filters.status !== 'all' ? filters.status : undefined
        })
      ]);

      setStats(statsRes as FinanceStats);
      setTransactions(transactionsRes as Transaction[]);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      completed: { color: 'success', label: 'Concluído' },
      pending: { color: 'warning', label: 'Pendente' },
      cancelled: { color: 'error', label: 'Cancelado' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <Chip 
        label={config.label}
        color={config.color as any}
        size="small"
      />
    );
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
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
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Typography variant="h4">
          {typeof value === 'number' ? `R$ ${value.toFixed(2)}` : value}
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
        Financeiro
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Receita Total"
            value={stats?.totalRevenue}
            icon={<MoneyIcon sx={{ color: 'white' }} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Receita Mensal"
            value={stats?.monthlyRevenue}
            icon={<TrendingUpIcon sx={{ color: 'white' }} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pagamentos Pendentes"
            value={stats?.pendingPayments}
            icon={<AccountIcon sx={{ color: 'white' }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Assinaturas Ativas"
            value={stats?.activeSubscriptions}
            icon={<ReceiptIcon sx={{ color: 'white' }} />}
            color={theme.palette.info.main}
          />
        </Grid>

        {/* Filtros */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <DatePicker 
                  label="Data Inicial"
                  value={dateRange.start}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, start: newValue || new Date() }))}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <DatePicker 
                  label="Data Final"
                  value={dateRange.end}
                  onChange={(newValue) => setDateRange(prev => ({ ...prev, end: newValue || new Date() }))}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filters.type}
                    label="Tipo"
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="income">Receita</MenuItem>
                    <MenuItem value="expense">Despesa</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="completed">Concluído</MenuItem>
                    <MenuItem value="pending">Pendente</MenuItem>
                    <MenuItem value="cancelled">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Tabela de Transações */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Transações
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        <Typography
                          color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        >
                          R$ {transaction.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.type === 'income' ? 'Receita' : 'Despesa'}
                          color={transaction.type === 'income' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{getStatusChip(transaction.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Finance;