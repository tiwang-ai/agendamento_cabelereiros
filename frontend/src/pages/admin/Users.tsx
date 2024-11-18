// src/pages/admin/Users.tsx
import { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Lock as LockIcon } from '@mui/icons-material';
import api from '../../services/api';
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

  useEffect(() => {
    loadUsers();
    loadEstablishments();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/api/users/');
      setUsers(response.data);
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
        estabelecimento_id: formData.estabelecimento_id || null,
        password: formData.password
      };

      if (selectedUser) {
        await api.put(`/api/users/${selectedUser.id}/`, userData);
      } else {
        await api.post('/api/users/', userData);
      }

      loadUsers();
      handleCloseDialog();
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Erro ao salvar usuário');
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <TextField
                fullWidth
                label="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Tipo de Usuário</InputLabel>
                <Select
                  value={formData.role}
                  label="Tipo de Usuário"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
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
                    value={formData.estabelecimento_id}
                    label="Estabelecimento"
                    onChange={(e) => setFormData({ ...formData, estabelecimento_id: e.target.value })}
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
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <TextField
                fullWidth
                label="Confirmar Senha"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
      </Paper>
    </Container>
  );
};

export default UsersManagement;