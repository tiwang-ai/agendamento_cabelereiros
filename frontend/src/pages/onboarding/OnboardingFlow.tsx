// src/pages/onboarding/OnboardingFlow.tsx
import { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Container, Paper } from '@mui/material';

const steps = [
  'Informações Básicas',
  'Dados do Salão',
  'Profissionais',
  'Serviços',
  'Pagamento',
  'Finalização'
];

interface OnboardingData {
  // Dados básicos
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
  // Serviços selecionados
  services: Array<{
    id: string;
    price: number;
  }>;
}

const OnboardingFlow = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    basicInfo: { name: '', email: '', phone: '' },
    salonInfo: { name: '', address: '', phone: '', openingHours: '' },
    professionals: [],
    services: []
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepContent = () => {
    switch (activeStep) {
      case 0:
        return <BasicInfoStep data={data} onUpdate={setData} />;
      case 1:
        return <SalonInfoStep data={data} onUpdate={setData} />;
      // ... outros steps
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {handleStepContent()}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
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