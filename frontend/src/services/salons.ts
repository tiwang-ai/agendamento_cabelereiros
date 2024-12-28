// src/services/salons.ts
import api from './api';

export const SalonService = {
  getAll: async () => {
    const response = await api.get('/api/estabelecimentos/');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/estabelecimentos/${id}/`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/api/estabelecimentos/', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/api/estabelecimentos/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/estabelecimentos/${id}/`);
    return response.data;
  },

  getProfessionals: async (id: string) => {
    const response = await api.get('/api/profissionais/', {
      params: { estabelecimento_id: id }
    });
    return response.data;
  },

  getServices: async (id: string) => {
    const response = await api.get('/api/servicos/', {
      params: { estabelecimento_id: id }
    });
    return response.data;
  },

  getDetails: async (id: string) => {
    const response = await api.get(`/api/estabelecimentos/${id}/details/`);
    return response.data;
  }
};