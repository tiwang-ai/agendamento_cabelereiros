// src/services/auth.ts
import { UserRole } from '../types/auth';

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://cabelereiro-production.up.railway.app';

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para adicionar token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

      const response = await axiosInstance.post<LoginResponse>('/api/auth/login/', {
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
        
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
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
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};