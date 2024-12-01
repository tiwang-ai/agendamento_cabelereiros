// frontend/landing/pages/index.tsx
import { Box } from '@mui/material';
import React from 'react';

import Features from '../components/Features';
import Hero from '../components/Hero';
import PricingCards from '../components/PricingCards';
import Testimonials from '../components/Testimonials';

const LandingPage = () => {
  return (
    <Box>
      {/* Hero com WhatsApp Demo */}
      <Hero />

      {/* Features */}
      <Features />

      {/* Depoimentos */}
      <Testimonials />

      {/* Planos e Preços */}
      <PricingCards 
        onPlanSelect={(plan) => {
          window.location.href = `https://app.site.com.br/register?plan=${plan}`;
        }}
      />
    </Box>
  );
};

export default LandingPage;