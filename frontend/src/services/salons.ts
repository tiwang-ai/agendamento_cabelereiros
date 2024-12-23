// src/services/salons.ts
import api from './api';

export const SalonService = {
  getAll: async () => {
    try {
      const response = await api.get('/api/estabelecimentos/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar salões:', error);
      throw error;
    }
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/estabelecimentos/${id}/`);
    return response.data;
  },

  create: async (data: any) => {
    try {
      const response = await api.post('/api/estabelecimentos/', {
        ...data,
        create_instance: true
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar salão:', error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/api/estabelecimentos/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    try {
      await api.delete(`/api/estabelecimentos/${id}/`);
    } catch (error: any) {
      console.error('Erro ao deletar salão:', error.response?.data || error.message);
      throw error;
    }
  }
};