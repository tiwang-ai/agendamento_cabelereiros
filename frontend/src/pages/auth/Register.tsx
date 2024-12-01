import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const steps = ['Informações Básicas', 'Dados do Salão', 'Serviços'];

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Dados básicos
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Dados do salão
    salonName: '',
    salonAddress: '',
    salonPhone: '',
    // Serviços
    services: [{ name: '', price: '' }]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/register', formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Erro ao realizar cadastro.');
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              name="name"
              label="Nome Completo"
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="phone"
              label="Telefone"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Senha"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              name="salonName"
              label="Nome do Salão"
              value={formData.salonName}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="salonAddress"
              label="Endereço do Salão"
              value={formData.salonAddress}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="salonPhone"
              label="Telefone do Salão"
              value={formData.salonPhone}
              onChange={handleInputChange}
            />
          </>
        );
      case 2:
        return (
          <>
            {formData.services.map((service, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Nome do Serviço"
                  value={service.name}
                  onChange={(e) => {
                    const newServices = [...formData.services];
                    newServices[index].name = e.target.value;
                    setFormData({ ...formData, services: newServices });
                  }}
                />
                <TextField
                  required
                  label="Preço"
                  type="number"
                  value={service.price}
                  onChange={(e) => {
                    const newServices = [...formData.services];
                    newServices[index].price = e.target.value;
                    setFormData({ ...formData, services: newServices });
                  }}
                />
              </Box>
            ))}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFormData({
                ...formData,
                services: [...formData.services, { name: '', price: '' }]
              })}
            >
              Adicionar Serviço
            </Button>
          </>
        );
      default:
        return 'Unknown step';
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
        background: 'linear-gradient(45deg, #7C4DFF 30%, #B47CFF 90%)',
        p: 3,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
              Criar Conta
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Comece sua jornada com nossa plataforma
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={activeStep === steps.length - 1 ? handleSubmit : undefined}>
            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Voltar
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  type="submit"
                >
                  Finalizar Cadastro
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Próximo
                </Button>
              )}
            </Box>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none' }}
            >
              Já tem uma conta? Faça login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;