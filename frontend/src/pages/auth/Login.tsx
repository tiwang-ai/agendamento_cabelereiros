import { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth';
import { UserRole } from '../../types/auth';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const credentials = {
        email: formData.email,
        password: formData.password
      };
      
      const data = await AuthService.login(credentials);
      
      if (data.role === UserRole.ADMIN) {
        navigate('/admin/dashboard');
      } else if (data.role === UserRole.OWNER) {
        navigate('/dashboard');
      } else {
        navigate('/calendar');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.email?.[0] ||
                          'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
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

          <Stack
            component="form"
            onSubmit={handleSubmit}
            spacing={2}
            sx={{ width: '100%' }}
          >
            <TextField
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
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