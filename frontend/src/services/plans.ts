// src/services/plans.ts
import api from './api';

export interface Plan {
  id: number;
  name: string;
  price: number;
  maxProfessionals: number;
  features: string[];
  active: boolean;
}

export const PlansService = {
  getAll: async () => {
    const response = await api.get('/plans/');
    return response.data;
  },

  create: async (planData: Omit<Plan, 'id'>) => {
    const response = await api.post('/plans/', planData);
    return response.data;
  },

  update: async (id: number, planData: Partial<Plan>) => {
    const response = await api.put(`/plans/${id}/`, planData);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/plans/${id}/`);
  }
};