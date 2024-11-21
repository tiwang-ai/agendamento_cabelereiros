// frontend/landing/pages/index.tsx
import React from 'react';
import { Box } from '@mui/material';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import PricingCards from '../components/PricingCards';

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