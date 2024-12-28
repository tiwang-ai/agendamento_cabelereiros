// src/pages/admin/SalonDetails.tsx
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import api from '../../services/api';
import { SalonService } from '../../services/salons';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const SalonDetails = () => {
  const { id } = useParams();
  const [salon, setSalon] = useState<any>(null);
  const [professionals, setProfessionals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadSalonData();
  }, [id]);

  const loadSalonData = async () => {
    try {
      setLoading(true);
      const [salonData, professionalsData, servicesData] = await Promise.all([
        SalonService.getById(id!),
        SalonService.getProfessionals(id!),
        SalonService.getServices(id!)
      ]);
      
      setSalon(salonData);
      setProfessionals(professionalsData);
      setServices(servicesData);
    } catch (error) {
      console.error('Erro ao carregar dados do salão:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: any, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <Box component="div">Carregando...</Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              {salon.nome}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {salon.endereco}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Profissionais
                </Typography>
                <Typography variant="h4">
                  {professionals.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Serviços
                </Typography>
                <Typography variant="h4">
                  {services.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Agendamentos
                </Typography>
                <Typography variant="h4">
                  {appointments.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Informações" />
          <Tab label="Profissionais" />
          <Tab label="Serviços" />
          <Tab label="Agendamentos" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Detalhes do Estabelecimento
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>
                  <Box component="strong" sx={{ fontWeight: 'bold' }}>Telefone:</Box> {salon.telefone}
                </Typography>
                <Typography>
                  <Box component="strong" sx={{ fontWeight: 'bold' }}>WhatsApp:</Box> {salon.whatsapp}
                </Typography>
                <Typography>
                  <Box component="strong" sx={{ fontWeight: 'bold' }}>Horário:</Box> {salon.horario_funcionamento}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Especialidade</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {professionals.map((prof: any) => (
                  <TableRow key={prof.id}>
                    <TableCell>{prof.nome}</TableCell>
                    <TableCell>{prof.especialidade}</TableCell>
                    <TableCell>
                      <Chip 
                        label={prof.ativo ? 'Ativo' : 'Inativo'} 
                        color={prof.ativo ? 'success' : 'error'} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Serviço</TableCell>
                  <TableCell>Duração</TableCell>
                  <TableCell>Preço</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service: any) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.nome_servico}</TableCell>
                    <TableCell>{service.duracao} min</TableCell>
                    <TableCell>R$ {service.preco.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Serviço</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.cliente.nome}</TableCell>
                    <TableCell>{app.servico.nome_servico}</TableCell>
                    <TableCell>
                      {new Date(app.data_agendamento).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={app.status} 
                        color={app.status === 'confirmed' ? 'success' : 'warning'} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default SalonDetails;