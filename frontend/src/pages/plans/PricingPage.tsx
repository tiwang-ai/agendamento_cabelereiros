// src/pages/plans/PricingPage.tsx
import { Box, Container, Grid, Typography, Button, Card, CardContent } from '@mui/material';

interface PlanFeature {
  title: string;
  included: boolean;
}

interface PlanProps {
  title: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: PlanFeature[];
  recommended?: boolean;
}

const PlanCard = ({ title, price, period, features, recommended }: PlanProps) => {
  return (
    <Card 
      elevation={recommended ? 8 : 1}
      sx={{ 
        height: '100%',
        position: 'relative',
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h3" component="div" gutterBottom>
          R$ {price}
          <Typography variant="subtitle1" component="span" color="text.secondary">
            /{period === 'monthly' ? 'mês' : 'ano'}
          </Typography>
        </Typography>
        <Box sx={{ my: 2 }}>
          {features.map((feature, index) => (
            <Typography
              key={index}
              variant="body1"
              color={feature.included ? 'text.primary' : 'text.secondary'}
              sx={{ 
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {feature.included ? '✓' : '×'} {feature.title}
            </Typography>
          ))}
        </Box>
        <Button
          variant={recommended ? 'contained' : 'outlined'}
          fullWidth
          size="large"
          sx={{ mt: 2 }}
        >
          Selecionar Plano
        </Button>
      </CardContent>
    </Card>
  );
};

const PricingPage = () => {
  const plans: PlanProps[] = [
    {
      title: 'Básico',
      price: 99,
      period: 'monthly',
      features: [
        { title: 'Até 2 profissionais', included: true },
        { title: 'Agenda online', included: true },
        { title: 'Atendimento via WhatsApp', included: true },
        { title: 'Relatórios básicos', included: true },
      ]
    },
    {
      title: 'Profissional',
      price: 199,
      period: 'monthly',
      recommended: true,
      features: [
        { title: 'Até 5 profissionais', included: true },
        { title: 'Agenda online', included: true },
        { title: 'Atendimento via WhatsApp', included: true },
        { title: 'Relatórios avançados', included: true },
        { title: 'Marketing automático', included: true },
      ]
    },
    {
      title: 'Enterprise',
      price: 299,
      period: 'monthly',
      features: [
        { title: 'Profissionais ilimitados', included: true },
        { title: 'Agenda online', included: true },
        { title: 'Atendimento via WhatsApp', included: true },
        { title: 'Relatórios personalizados', included: true },
        { title: 'Marketing automático', included: true },
        { title: 'API personalizada', included: true },
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" align="center" gutterBottom>
        Escolha o Plano Ideal
      </Typography>
      
      <Grid container spacing={3} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.title}>
            <PlanCard {...plan} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PricingPage;