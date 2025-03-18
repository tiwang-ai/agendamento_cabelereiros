import api from '@/lib/axios';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login/', credentials);
  const { access, refresh, user } = response.data;
  
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register/', data);
  const { access, refresh, user } = response.data;
  
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  
  return response.data;
};

export const refreshToken = async (): Promise<string> => {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) throw new Error('No refresh token available');

  const response = await api.post<{ access: string }>('/api/auth/refresh/', {
    refresh
  });

  const { access } = response.data;
  localStorage.setItem('access_token', access);
  
  return access;
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/api/auth/logout/');
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get<User>('/api/auth/profile/');
  return response.data;
}; 