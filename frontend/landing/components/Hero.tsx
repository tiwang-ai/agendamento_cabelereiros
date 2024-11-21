// frontend/landing/components/Hero.tsx
import React from 'react';
import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import WhatsAppDemo from './Demo/WhatsAppDemo';

const Hero = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        display: 'flex',
        alignItems: 'center',
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' },
            gap: 8,
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
              Automatize seu Salão com IA
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Agendamentos automáticos via WhatsApp 24/7. Aumente sua eficiência e faturamento.
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              sx={{ 
                py: 2,
                px: 4,
                fontSize: '1.2rem'
              }}
            >
              Começar Agora
            </Button>
          </Box>

          <WhatsAppDemo />
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;