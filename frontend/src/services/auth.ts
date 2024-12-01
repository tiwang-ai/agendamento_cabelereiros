// src/services/auth.ts
import { UserRole } from '../types/auth';

import api from './api';

interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  email: string;
  name: string;
  role: UserRole;
  estabelecimento_id?: number;
  phone?: string;
}

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      if (credentials.phone) {
        credentials.phone = credentials.phone.replace(/\D/g, '');
      }

      console.log('Enviando credenciais:', {
        ...(credentials.email ? { email: credentials.email } : {}),
        ...(credentials.phone ? { phone: credentials.phone } : {}),
        password: '***'
      });

      const response = await api.post<LoginResponse>('/auth/login/', {
        ...(credentials.email ? { email: credentials.email } : {}),
        ...(credentials.phone ? { phone: credentials.phone } : {}),
        password: credentials.password
      });
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('userData', JSON.stringify({
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
          estabelecimento_id: response.data.estabelecimento_id,
          phone: response.data.phone
        }));
        
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Erro detalhado:', error.response?.data);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    delete api.defaults.headers.common['Authorization'];
  }
};