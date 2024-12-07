// frontend/landing/components/Features.tsx
import { 
  AutoAwesome, 
  Schedule, 
  WhatsApp, 
  Analytics,
  Psychology,
  Payments,
  SvgIconComponent
} from '@mui/icons-material';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import React from 'react';

interface FeatureProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
}

const Feature = ({ icon: IconComponent, title, description }: FeatureProps) => (
  <Paper
    sx={{
      p: 4,
      height: '100%',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-8px)'
      }
    }}
  >
    <Box sx={{ color: 'primary.main', mb: 2 }}>
      <IconComponent sx={{ fontSize: 40 }} />
    </Box>
    <Typography variant="h5" gutterBottom>
      {title}
    </Typography>
    <Typography color="text.secondary">
      {description}
    </Typography>
  </Paper>
);

const features: FeatureProps[] = [
  {
    icon: AutoAwesome,
    title: 'Atendimento Inteligente',
    description: 'IA que entende e responde naturalmente, como um assistente real'
  },
  {
    icon: Schedule,
    title: 'Agendamento 24/7',
    description: 'Seus clientes podem agendar a qualquer momento, sem intervenção humana'
  },
  {
    icon: WhatsApp,
    title: 'Integração WhatsApp',
    description: 'Comunicação direta pelo app mais usado pelos brasileiros'
  },
  {
    icon: Analytics,
    title: 'Análises Detalhadas',
    description: 'Acompanhe métricas e crescimento do seu negócio'
  },
  {
    icon: Psychology,
    title: 'IA Personalizada',
    description: 'Bot que aprende o perfil do seu salão e clientes'
  },
  {
    icon: Payments,
    title: 'Gestão Financeira',
    description: 'Controle completo de agendamentos e faturamento'
  }
];

const Features = () => {
  return (
    <Box sx={{ py: 12, bgcolor: 'grey.50' }}>
      <Container>
        <Typography 
          variant="h2" 
          align="center" 
          gutterBottom
          sx={{ mb: 8 }}
        >
          Tudo que você precisa para crescer
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Feature
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;