// src/services/users.ts
import api from './api';

export const UserService = {
  getAll: async () => {
    const response = await api.get('/api/users/');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/users/${id}/`);
    return response.data;
  },

  create: async (userData: any) => {
    const response = await api.post('/api/users/', userData);
    return response.data;
  },

  update: async (id: string, userData: any) => {
    const response = await api.put(`/api/users/${id}/`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/api/users/${id}/`);
  }
};