// src/pages/onboarding/OnboardingFlow.tsx
import { Box, Stepper, Step, StepLabel, Button, Container, Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../services/api';


import PaymentStep from './steps/PaymentStep';
import ProfessionalsStep from './steps/ProfessionalsStep';
import SalonInfoStep from './steps/SalonInfoStep';
import ServicesStep from './steps/ServicesStep';

interface OnboardingData {
  // Dados básicos já coletados no registro
  basicInfo: {
    name: string;
    email: string;
    phone: string;
  };
  // Dados do salão
  salonInfo: {
    name: string;
    address: string;
    phone: string;
    openingHours: string;
  };
  // Profissionais (limitado pelo plano)
  professionals: Array<{
    name: string;
    specialties: string[];
    phone: string;
  }>;
  // Serviços selecionados do catálogo
  services: Array<{
    systemServiceId: number;
    price?: number;
    duration?: number;
  }>;
  // Dados de pagamento
  payment: {
    planId: string;
    method: string;
  };
}

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    basicInfo: JSON.parse(localStorage.getItem('registrationData') || '{}'),
    salonInfo: {
      name: '',
      address: '',
      phone: '',
      openingHours: ''
    },
    professionals: [],
    services: [],
    payment: {
      planId: localStorage.getItem('selectedPlanId') || '',
      method: ''
    }
  });

  const steps = [
    {
      label: 'Dados do Salão',
      component: <SalonInfoStep data={data} onUpdate={setData} />
    },
    {
      label: 'Profissionais',
      component: <ProfessionalsStep data={data} onUpdate={setData} />
    },
    {
      label: 'Serviços',
      component: <ServicesStep data={data} onUpdate={setData} />
    },
    {
      label: 'Pagamento',
      component: <PaymentStep data={data} onUpdate={setData} />
    }
  ];

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      // Último passo - processar pagamento e finalizar
      try {
        // 1. Criar salão e configurações iniciais
        const salonResponse = await api.post('/onboarding/', data);
        
        // 2. Processar pagamento
        const paymentResponse = await api.post('/payments/process/', {
          planId: data.payment.planId,
          salonId: salonResponse.data.salonId,
          method: data.payment.method
        });

        // 3. Se pagamento ok, redirecionar para dashboard
        if (paymentResponse.data.status === 'approved') {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Erro ao finalizar onboarding:', error);
      }
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(step => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {steps[activeStep].component}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(prev => prev - 1)}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
            >
              {activeStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default OnboardingFlow;