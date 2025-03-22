/**
 * Serviços de Autenticação
 * 
 * Este arquivo define as funções de autenticação da aplicação com suporte a dois modos:
 * 1. Mock: Autenticação simulada para desenvolvimento e testes
 * 2. API Real: Autenticação com backend real
 * 
 * A configuração USE_MOCK_AUTH controla qual modo está ativo.
 */
import api from '@/lib/axios';
import { User, AuthResponse, LoginCredentials, RegisterData } from '@/types';
import { 
  mockLogin, 
  mockRefreshToken, 
  mockLogout, 
  mockGetProfile,
  mockRegister
} from './mockAuth';

/**
 * Controla o modo de autenticação
 * - true: Usa autenticação simulada (mock)
 * - false: Usa autenticação real com API
 * 
 * Em ambiente de produção, deve ser sempre false.
 * Idealmente, isso deveria vir de uma variável de ambiente.
 */
const USE_MOCK_AUTH = true;

/**
 * Normaliza os papéis vindos do backend para o formato usado no frontend
 * 
 * @param backendRole - Papel do usuário no formato do backend (maiúsculas)
 * @returns O papel normalizado para o formato do frontend
 */
const normalizeRole = (backendRole: string): string => {
  const roleMap: Record<string, string> = {
    'ADMIN': 'admin',
    'OWNER': 'salon_owner',
    'PROFESSIONAL': 'professional',
    'RECEPTIONIST': 'receptionist'
  };
  
  return roleMap[backendRole] || backendRole.toLowerCase();
};

/**
 * Realiza login do usuário
 * 
 * @param credentials - Credenciais de login (email e senha)
 * @returns Resposta contendo tokens e dados do usuário
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  console.log('[auth] Iniciando autenticação para:', credentials.email, 'Mock?', USE_MOCK_AUTH);
  
  try {
    let response: AuthResponse;
    
    if (USE_MOCK_AUTH) {
      // Usa autenticação mockada
      response = await mockLogin(credentials);
    } else {
      // Usa API real
      const apiResponse = await api.post<AuthResponse>('/api/auth/login/', credentials);
      response = apiResponse.data;
      
      // Normalizar o papel do usuário
      if (response.user && response.user.role) {
        response.user.role = normalizeRole(response.user.role);
      }
      
      // Armazena tokens no localStorage
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
    }
    
    // Verificação adicional para ter certeza que os tokens foram salvos
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.error('[auth] Token não foi armazenado corretamente após login!');
    } else {
      console.log('[auth] Token armazenado com sucesso após login');
    }
    
    return response;
  } catch (error) {
    console.error('[auth] Erro durante login:', error);
    throw error;
  }
};

/**
 * Registra um novo usuário
 * 
 * @param data - Dados de registro (nome, email, senha)
 * @returns Resposta contendo tokens e dados do usuário
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  if (USE_MOCK_AUTH) {
    return mockRegister(data);
  }

  const response = await api.post<AuthResponse>('/api/auth/register/', data);
  const { access, refresh, user } = response.data;
  
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
  
  return response.data;
};

/**
 * Atualiza o token de acesso usando o refresh token
 * 
 * @returns Novo token de acesso
 */
export const refreshToken = async (): Promise<string> => {
  console.log('[auth] Tentando refresh token. Mock?', USE_MOCK_AUTH);
  
  try {
    if (USE_MOCK_AUTH) {
      return await mockRefreshToken();
    }

    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      console.error('[auth] Sem refresh token disponível');
      throw new Error('No refresh token available');
    }

    const response = await api.post<{ access: string }>('/api/auth/refresh/', {
      refresh
    });

    const { access } = response.data;
    localStorage.setItem('access_token', access);
    
    return access;
  } catch (error) {
    console.error('[auth] Erro durante refresh token:', error);
    // Limpar tokens em caso de erro para evitar loops
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw error;
  }
};

/**
 * Realiza logout do usuário
 * 
 * Remove os tokens do localStorage e notifica o backend
 */
export const logout = async (): Promise<void> => {
  console.log('[auth] Iniciando logout. Mock?', USE_MOCK_AUTH);
  
  try {
    if (USE_MOCK_AUTH) {
      return await mockLogout();
    }

    try {
      // Notifica o backend sobre o logout (revogação de token)
      await api.post('/api/auth/logout/');
    } finally {
      // Sempre remove os tokens locais, mesmo em caso de erro
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  } catch (error) {
    console.error('[auth] Erro durante logout:', error);
    // Mesmo com erro, limpar os tokens locais
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

/**
 * Obtém o perfil do usuário atualmente autenticado
 * 
 * @returns Dados do usuário
 */
export const getProfile = async (): Promise<User> => {
  console.log('[auth] Obtendo perfil do usuário. Mock?', USE_MOCK_AUTH);
  
  try {
    if (USE_MOCK_AUTH) {
      return await mockGetProfile();
    }

    const response = await api.get<User>('/api/auth/profile/');
    
    // Normalizar o papel do usuário
    if (response.data && response.data.role) {
      response.data.role = normalizeRole(response.data.role);
    }
    
    return response.data;
  } catch (error) {
    console.error('[auth] Erro ao obter perfil:', error);
    throw error;
  }
}; 