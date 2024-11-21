// src/services/salons.ts
import api from './api';

export const SalonService = {
  getAll: async () => {
    const response = await api.get('/estabelecimentos/');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/estabelecimentos/${id}/`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/estabelecimentos/', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/estabelecimentos/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/estabelecimentos/${id}/`);
  }
};