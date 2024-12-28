// src/pages/admin/Users.tsx
import { Edit as EditIcon, Delete as DeleteIcon, Info as InfoIcon } from '@mui/icons-material';
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
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useState, useEffect, ChangeEvent } from 'react';

import api from '../../services/api';
import { UserService } from '../../services/users';
import { UserRole } from '../../types/auth';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  estabelecimento_id?: number;
  is_active: boolean;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [establishments, setEstablishments] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: UserRole.OWNER,
    estabelecimento_id: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    loadUsers();
    loadEstablishments();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await UserService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadEstablishments = async () => {
    try {
      const response = await api.get('/api/estabelecimentos/');
      setEstablishments(response.data);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        estabelecimento: formData.estabelecimento_id ? parseInt(formData.estabelecimento_id) : null,
        password: formData.password
      };

      if (selectedUser) {
        await UserService.update(selectedUser.id, userData);
      } else {
        await UserService.create(userData);
      }

      loadUsers();
      handleCloseDialog();
    } catch (error: any) {
      const errorData = error.response?.data;
      let errorMessage = 'Erro ao salvar usuário';
      
      if (typeof errorData === 'object') {
        const firstError = Object.values(errorData)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else if (typeof firstError === 'string') {
          errorMessage = firstError;
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/api/users/${id}/`);
        loadUsers();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        setError('Erro ao excluir usuário');
      }
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        estabelecimento_id: user.estabelecimento_id?.toString() || '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: UserRole.OWNER,
        estabelecimento_id: '',
        password: '',
        confirmPassword: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setError('');
  };

  const getRoleLabel = (role: UserRole) => {
    const roleLabels = {
      [UserRole.ADMIN]: 'Administrador',
      [UserRole.OWNER]: 'Dono do Salão',
      [UserRole.PROFESSIONAL]: 'Profissional',
      [UserRole.RECEPTIONIST]: 'Recepcionista'
    };
    return roleLabels[role];
  };

  const getRoleChip = (role: UserRole) => {
    const roleConfig = {
      [UserRole.ADMIN]: { color: 'error', label: 'Admin' },
      [UserRole.OWNER]: { color: 'primary', label: 'Dono' },
      [UserRole.PROFESSIONAL]: { color: 'success', label: 'Profissional' },
      [UserRole.RECEPTIONIST]: { color: 'warning', label: 'Recepcionista' }
    };
    const config = roleConfig[role];
    
    return (
      <Chip 
        label={config.label}
        color={config.color as any}
        size="small"
      />
    );
  };

  const handleTextFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewDetails = async (userId: string) => {
    try {
      const response = await UserService.getDetails(userId);
      setSelectedUserDetails(response);
      setDetailsDialogOpen(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      setError('Erro ao carregar detalhes do usuário');
    }
  };

  const UserDetailsDialog = () => (
    <Dialog 
      open={detailsDialogOpen} 
      onClose={() => setDetailsDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Detalhes do Usuário
      </DialogTitle>
      <DialogContent>
        {selectedUserDetails && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Informações Básicas</Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Nome" 
                    secondary={selectedUserDetails.user.name} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Email" 
                    secondary={selectedUserDetails.user.email} 
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Função" 
                    secondary={getRoleLabel(selectedUserDetails.user.role)} 
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6">Atividades Recentes</Typography>
              <List>
                {selectedUserDetails.activities.map((activity: any, index: number) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={activity.action}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {selectedUserDetails.professional_data && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Dados Profissionais</Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Total de Agendamentos" 
                      secondary={selectedUserDetails.professional_data.total_appointments} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Avaliação Média" 
                      secondary={selectedUserDetails.professional_data.rating?.toFixed(1) || 'N/A'} 
                    />
                  </ListItem>
                </List>
              </Grid>
            )}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDetailsDialogOpen(false)}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">
            Gerenciamento de Usuários
          </Typography>
          <Button 
            variant="contained"
            onClick={() => handleOpenDialog()}
          >
            Adicionar Usuário
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Estabelecimento</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{getRoleChip(user.role)}</TableCell>
                  <TableCell>
                    {establishments.find(e => e.id === user.estabelecimento_id)?.nome || '-'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleViewDetails(user.id)}>
                      <InfoIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDialog(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
              <TextField
                fullWidth
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleTextFieldChange}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleTextFieldChange}
              />
              <TextField
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleTextFieldChange}
              />
              <FormControl fullWidth>
                <InputLabel>Tipo de Usuário</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Tipo de Usuário"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={UserRole.ADMIN}>Administrador</MenuItem>
                  <MenuItem value={UserRole.OWNER}>Dono do Salão</MenuItem>
                  <MenuItem value={UserRole.PROFESSIONAL}>Profissional</MenuItem>
                  <MenuItem value={UserRole.RECEPTIONIST}>Recepcionista</MenuItem>
                </Select>
              </FormControl>
              {formData.role !== UserRole.ADMIN && (
                <FormControl fullWidth>
                  <InputLabel>Estabelecimento</InputLabel>
                  <Select
                    name="estabelecimento_id"
                    value={formData.estabelecimento_id}
                    label="Estabelecimento"
                    onChange={handleSelectChange}
                  >
                    {establishments.map((est) => (
                      <MenuItem key={est.id} value={est.id}>
                        {est.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <TextField
                fullWidth
                label="Senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleTextFieldChange}
              />
              <TextField
                fullWidth
                label="Confirmar Senha"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleTextFieldChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
        
        <UserDetailsDialog />
      </Paper>
    </Container>
  );
};

export default UsersManagement;