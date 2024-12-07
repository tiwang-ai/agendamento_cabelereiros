// src/services/users.ts
import api from './api';

export const UserService = {
  getAll: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },

  create: async (userData: any) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  update: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}/`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/users/${id}/`);
  }
};