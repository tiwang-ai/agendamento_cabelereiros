// src/services/auth.ts
import api from './api';
import { UserRole } from '../types/auth';

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
}

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login/', credentials);
      
      if (response.data.access) {
        // Salva os tokens
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Salva os dados do usuário
        localStorage.setItem('userData', JSON.stringify({
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
          estabelecimento_id: response.data.estabelecimento_id
        }));
        
        // Configura o token no header das requisições
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      }
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    delete api.defaults.headers.common['Authorization'];
  }
};