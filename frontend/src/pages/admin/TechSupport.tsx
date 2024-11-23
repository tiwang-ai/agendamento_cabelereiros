import { useState, useEffect } from 'react';
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
  Tab
} from '@mui/material';
import api from '../../services/api';

interface SystemLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

const TechSupport = () => {
  const [tabValue, setTabValue] = useState(0);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    // Implementar chamada à API para buscar logs
    fetchSystemLogs();
  }, []);

  const fetchSystemLogs = async () => {
    try {
      const response = await api.get('/admin/system-logs/');
      setSystemLogs(response.data);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Suporte Técnico
        </Typography>

        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Logs do Sistema" />
          <Tab label="Ações dos Usuários" />
          <Tab label="Problemas Reportados" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
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
        </Box>
      </Paper>
    </Container>
  );
};

export default TechSupport;