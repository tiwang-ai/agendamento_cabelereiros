import api from './api';

export const StaffService = {
  getAll: async () => {
    const response = await api.get('/api/admin/staff/');
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
  }
}; 