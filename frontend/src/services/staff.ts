import api from './api';

export const StaffService = {
  getAll: async () => {
    const response = await api.get('/api/admin/staff/');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/admin/staff/${id}/`);
    return response.data;
  },

  getActivities: async (userId?: number) => {
    const url = userId 
      ? `/api/admin/staff/activities/${userId}/`
      : '/api/admin/staff/activities/';
    const response = await api.get(url);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/api/admin/staff/${id}/`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/admin/stats/');
    return response.data;
  },

  getSystemLogs: async () => {
    const response = await api.get('/api/admin/system-logs/');
    return response.data;
  },

  getSystemMetrics: async () => {
    const response = await api.get('/api/admin/system-metrics/');
    return response.data;
  }
}; 