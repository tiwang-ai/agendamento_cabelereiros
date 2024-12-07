// src/services/payment.ts
import api from './api';

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  period: 'monthly' | 'yearly';
}

export const PaymentService = {
  createPreference: async (planId: string) => {
    const response = await api.post('/payments/preference', { planId });
    return response.data;
  },

  processPayment: async (paymentData: any) => {
    const response = await api.post('/payments/process', paymentData);
    return response.data;
  }
};