// frontend/landing/components/Testimonials.tsx
import { Box, Container, Typography, Card, CardContent, Avatar, Grid } from '@mui/material';

const testimonials = [
  {
    name: 'João Silva',
    role: 'Dono de Barbearia',
    avatar: '/avatars/joao.jpg',
    text: 'Aumentei meu faturamento em 40% com o sistema de agendamento automático.'
  },
  {
    name: 'Maria Santos',
    role: 'Proprietária de Salão',
    avatar: '/avatars/maria.jpg',
    text: 'Meus clientes adoram a facilidade de agendar pelo WhatsApp.'
  },
  {
    name: 'Pedro Costa',
    role: 'Barbeiro',
    avatar: '/avatars/pedro.jpg',
    text: 'O sistema me ajudou a organizar melhor minha agenda.'
  }
];

const Testimonials = () => {
  return (
    <Box sx={{ py: 8, bgcolor: 'grey.100' }}>
      <Container>
        <Typography variant="h3" align="center" gutterBottom>
          O que nossos clientes dizem
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar src={testimonial.avatar} sx={{ width: 60, height: 60, mr: 2 }} />
                    <Box>
                      <Typography variant="h6">{testimonial.name}</Typography>
                      <Typography color="text.secondary">{testimonial.role}</Typography>
                    </Box>
                  </Box>
                  <Typography>{testimonial.text}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials;