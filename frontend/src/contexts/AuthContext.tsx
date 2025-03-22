/**
 * Contexto de Autenticação
 * 
 * Este arquivo implementa o contexto global de autenticação, fornecendo:
 * - Informações do usuário autenticado
 * - Estado de carregamento
 * - Funções de login e logout
 * 
 * É um componente central para o sistema de autenticação da aplicação.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '@/types/auth';
import { login as loginService, logout as logoutService, getProfile } from '@/services/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  getInitialRoute: () => string;
}

// Cria o contexto com um valor padrão (será sobrescrito pelo Provider)
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/**
 * Provedor do contexto de autenticação
 * 
 * Deve envolver os componentes que precisam acessar informações de autenticação.
 * Geralmente é colocado no nível raiz da aplicação.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (localStorage.getItem('access_token')) {
          const userData = await getProfile();
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginService({ email, password });
      setUser(response.user);
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutService();
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('mock_user');
    } finally {
      setLoading(false);
    }
  };

  const getInitialRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case UserRole.SUPERUSER:
      case UserRole.ADMIN:
        return '/admin/dashboard';
      case UserRole.SALON_OWNER:
        return '/salon/dashboard';
      case UserRole.PROFESSIONAL:
        return '/professional/dashboard';
      case UserRole.RECEPTIONIST:
        return '/receptionist/dashboard';
      default:
        return '/login';
    }
  };

  if (loading && !user && !localStorage.getItem('access_token')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getInitialRoute }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto de autenticação
 * 
 * @returns Objeto com o usuário, estado de carregamento e funções de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};