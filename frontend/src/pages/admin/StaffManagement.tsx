// frontend/src/pages/admin/StaffManagement.tsx
import {
  Edit as EditIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Tab,
  Tabs
} from '@mui/material';
import { format } from 'date-fns';
import { useState, useEffect , ChangeEvent } from 'react';

import api from '../../services/api';



interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_activity: string;
  custom_permissions: Record<string, boolean>;
}

interface ActivityLog {
  id: number;
  user: string;
  action: string;
  details: string;
  timestamp: string;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openActivityDialog, setOpenActivityDialog] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadStaffMembers();
  }, []);

  const loadStaffMembers = async () => {
    try {
      const response = await api.get('/admin/staff/');
      setStaff(response.data);
    } catch (error) {
      setError('Erro ao carregar equipe');
    }
  };

  const loadActivities = async (userId?: number) => {
    try {
      const url = userId 
        ? `/admin/staff/activities/${userId}/`
        : '/admin/staff/activities/';
      const response = await api.get(url);
      setActivities(response.data);
      setOpenActivityDialog(true);
    } catch (error) {
      setError('Erro ao carregar atividades');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedMember) {
        await api.put(`/admin/staff/${selectedMember.id}/`, selectedMember);
      }
      loadStaffMembers();
      setOpenDialog(false);
    } catch (error) {
      setError('Erro ao salvar alterações');
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedMember(prev => 
      prev ? {...prev, name: e.target.value} : null
    );
  };

  const handleStatusChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedMember(prev =>
      prev ? {...prev, is_active: e.target.checked} : null
    );
  };

  const handlePermissionChange = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedMember(prev =>
      prev ? {
        ...prev,
        custom_permissions: {
          ...prev.custom_permissions,
          [key]: e.target.checked
        }
      } : null
    );
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Gerenciamento de Equipe Staff
        </Typography>

        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Membros" />
          <Tab label="Atividades" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Função</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Última Atividade</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      <Chip 
                        label={member.is_active ? 'Ativo' : 'Inativo'}
                        color={member.is_active ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      {member.last_activity ? 
                        format(new Date(member.last_activity), 'dd/MM/yyyy HH:mm') : 
                        'Nunca'
                      }
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => {
                        setSelectedMember(member);
                        setOpenDialog(true);
                      }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => loadActivities(member.id)}>
                        <HistoryIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tabValue === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Ação</TableCell>
                  <TableCell>Detalhes</TableCell>
                  <TableCell>Data/Hora</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>{activity.details}</TableCell>
                    <TableCell>
                      {format(new Date(activity.timestamp), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            Editar Membro da Equipe
          </DialogTitle>
          <Box component="form" onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                fullWidth
                label="Nome"
                value={selectedMember?.name || ''}
                onChange={handleNameChange}
                margin="normal"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedMember?.is_active || false}
                    onChange={handleStatusChange}
                  />
                }
                label="Ativo"
              />

              {/* Permissões personalizadas */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Permissões
                </Typography>
                {Object.entries(selectedMember?.custom_permissions || {}).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        checked={value}
                        onChange={handlePermissionChange(key)}
                      />
                    }
                    label={key}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained">
                Salvar
              </Button>
            </DialogActions>
          </Box>
        </Dialog>

        <Dialog 
          open={openActivityDialog} 
          onClose={() => setOpenActivityDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Histórico de Atividades</DialogTitle>
          <DialogContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuário</TableCell>
                    <TableCell>Ação</TableCell>
                    <TableCell>Detalhes</TableCell>
                    <TableCell>Data/Hora</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.details}</TableCell>
                      <TableCell>
                        {format(new Date(activity.timestamp), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenActivityDialog(false)}>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default StaffManagement;