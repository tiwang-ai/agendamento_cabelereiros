// frontend/landing/components/Hero.tsx
import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';

const WhatsAppDemo = lazy(() => import('./Demo/WhatsAppDemo'));

const Hero = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        overflow: 'hidden'
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr'
            },
            gap: { xs: 4, md: 8 },
            alignItems: 'center',
            py: { xs: 4, md: 0 }
          }}
        >
          <Box sx={{ px: { xs: 2, md: 0 } }}>
            <Typography 
              variant="h1" 
              sx={{ 
                mb: 4, 
                fontWeight: 'bold',
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' }
              }}
            >
              Automatize seu Salão com IA
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
            >
              Agendamentos automáticos via WhatsApp 24/7. Aumente sua eficiência e faturamento.
            </Typography>
            <Button
              variant="contained"
              size="large"
              color="secondary"
              sx={{ 
                py: { xs: 1.5, md: 2 },
                px: { xs: 3, md: 4 },
                fontSize: { xs: '1rem', md: '1.2rem' }
              }}
            >
              Começar Agora
            </Button>
          </Box>

          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
              width: '100%',
              height: '100%'
            }}
          >
            <Box sx={{ 
              width: { xs: '100%', md: 'auto' },
              maxWidth: '400px'
            }}>
              <Suspense fallback={<div>Loading...</div>}>
                <WhatsAppDemo />
              </Suspense>
            </Box>

            <Box 
              component={AnimatePresence}
              sx={{ 
                position: 'absolute',
                right: { xs: '-50%', md: '-70%' },
                width: { xs: '100%', md: '400px' },
                opacity: 0.95,
                pointerEvents: 'none'
              }}
            >
              {/* Componentes dinâmicos aqui */}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;