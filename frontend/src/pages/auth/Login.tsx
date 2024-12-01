import { Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  useTheme,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthService } from '../../services/auth';
import { UserRole } from '../../types/auth';

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleMethodChange = (_: React.MouseEvent<HTMLElement>, newMethod: 'email' | 'phone') => {
    if (newMethod !== null) {
      setLoginMethod(newMethod);
      setFormData({ ...formData, email: '', phone: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const credentials = loginMethod === 'email' 
        ? { email: formData.email, password: formData.password }
        : { phone: formData.phone, password: formData.password };
      
      console.log('Enviando credenciais:', credentials);
      
      const data = await AuthService.login(credentials);
      
      // Redireciona baseado no papel do usuário
      switch (data.role) {
        case UserRole.ADMIN:
          navigate('/admin/dashboard');
          break;
        case UserRole.OWNER:
          navigate('/dashboard');
          break;
        case UserRole.PROFESSIONAL:
          navigate('/professional/agenda');
          break;
        default:
          navigate('/calendar');
      }
    } catch (err: any) {
      console.error('Erro completo:', err);
      setError(err.response?.data?.detail || 'Erro ao fazer login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        p: 3,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 4,
              fontWeight: 'bold',
              color: theme.palette.primary.main,
            }}
          >
            Bem-vindo
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 2,
                borderRadius: 1 
              }}
            >
              {error}
            </Alert>
          )}

          <ToggleButtonGroup
            value={loginMethod}
            exclusive
            onChange={handleMethodChange}
            sx={{ mb: 3, width: '100%' }}
          >
            <ToggleButton value="email" sx={{ width: '50%' }}>
              Email
            </ToggleButton>
            <ToggleButton value="phone" sx={{ width: '50%' }}>
              Telefone
            </ToggleButton>
          </ToggleButtonGroup>

          <Stack
            component="form"
            onSubmit={handleSubmit}
            spacing={2}
            sx={{ width: '100%' }}
          >
            {loginMethod === 'email' ? (
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <TextField
                required
                fullWidth
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <TextField
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              Entrar
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => navigate('/register')}
              sx={{
                textTransform: 'none',
                color: theme.palette.text.secondary,
              }}
            >
              Não tem uma conta? Cadastre-se
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;