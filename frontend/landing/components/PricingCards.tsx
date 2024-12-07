// frontend/landing/components/PricingCards.tsx
import { Box, Container, Grid, Typography, Button, Card, CardContent } from '@mui/material';

interface PricingCardsProps {
  onPlanSelect: (plan: string) => void;
}

const plans = [
  {
    id: 'basic',
    title: 'Básico',
    price: 99,
    features: [
      'Até 2 profissionais',
      'Agenda online',
      'Atendimento via WhatsApp',
      'Relatórios básicos'
    ]
  },
  {
    id: 'pro',
    title: 'Profissional',
    price: 199,
    recommended: true,
    features: [
      'Até 5 profissionais',
      'Agenda online',
      'Atendimento via WhatsApp',
      'Relatórios avançados',
      'Marketing automático'
    ]
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    price: 299,
    features: [
      'Profissionais ilimitados',
      'Agenda online',
      'Atendimento via WhatsApp',
      'Relatórios personalizados',
      'Marketing automático',
      'API personalizada'
    ]
  }
];

const PricingCards = ({ onPlanSelect }: PricingCardsProps) => {
  return (
    <Box sx={{ py: 8 }}>
      <Container>
        <Typography variant="h3" align="center" gutterBottom>
          Escolha seu Plano
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card 
                raised={plan.recommended}
                sx={{ 
                  height: '100%',
                  transform: plan.recommended ? 'scale(1.05)' : 'none'
                }}
              >
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {plan.title}
                  </Typography>
                  <Typography variant="h3" gutterBottom>
                    R$ {plan.price}
                    <Typography component="span" variant="subtitle1">/mês</Typography>
                  </Typography>
                  <Box sx={{ my: 4 }}>
                    {plan.features.map((feature, index) => (
                      <Typography key={index} sx={{ py: 1 }}>
                        ✓ {feature}
                      </Typography>
                    ))}
                  </Box>
                  <Button 
                    variant={plan.recommended ? 'contained' : 'outlined'}
                    fullWidth
                    onClick={() => onPlanSelect(plan.id)}
                  >
                    Começar Agora
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default PricingCards;