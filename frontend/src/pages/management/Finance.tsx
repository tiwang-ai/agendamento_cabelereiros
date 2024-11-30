// frontend/src/pages/management/Finance.tsx
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
  useTheme
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { FinanceService } from '../../services/finance';
import { Box as MuiBox } from '@mui/material';

interface SalonStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  totalAppointments: number;
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'cancelled';
}

const SalonFinance = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<SalonStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      const [statsRes, transactionsRes] = await Promise.all([
        FinanceService.getSalonStats(),
        FinanceService.getSalonTransactions()
      ]);

      setStats(statsRes);
      setTransactions(transactionsRes);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
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
    return <MuiBox>Carregando...</MuiBox>;
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
            icon={<ReceiptIcon sx={{ color: 'white' }} />}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Agendamentos"
            value={stats?.totalAppointments}
            icon={<ReceiptIcon sx={{ color: 'white' }} />}
            color={theme.palette.info.main}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Transações Recentes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Typography
                          color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        >
                          R$ {transaction.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={
                            transaction.status === 'completed' ? 'success' :
                            transaction.status === 'pending' ? 'warning' : 'error'
                          }
                          size="small"
                        />
                      </TableCell>
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

export default SalonFinance;