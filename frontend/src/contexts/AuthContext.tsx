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
import { User } from '@/types';
import { login as loginService, logout as logoutService, getProfile } from '@/services/auth';

/**
 * Interface do contexto de autenticação
 */
interface AuthContextType {
  user: User | null;       // Usuário atual ou null se não autenticado
  loading: boolean;        // Indica se está carregando dados de autenticação
  login: (email: string, password: string) => Promise<User>;  // Função para fazer login
  logout: () => Promise<void>;  // Função para fazer logout
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

  // Efeito para carregar o usuário no início da aplicação
  useEffect(() => {
    /**
     * Carrega o usuário do armazenamento local ou da API
     */
    const loadUser = async () => {
      try {
        if (localStorage.getItem('access_token')) {
          console.log('Token encontrado no localStorage, tentando carregar usuário...');
          const user = await getProfile();
          console.log('Usuário carregado:', user);
          setUser(user);
        } else {
          console.log('Nenhum token encontrado no localStorage');
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        // Limpar tokens em caso de erro para evitar loops
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Realiza o login do usuário
   * 
   * @param email - Email do usuário
   * @param password - Senha do usuário
   * @returns Dados do usuário autenticado
   */
  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      console.log('Iniciando login para:', email);
      const response = await loginService({ email, password });
      console.log('Login bem-sucedido:', response.user);
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Realiza o logout do usuário
   */
  const logout = async () => {
    setLoading(true);
    try {
      await logoutService();
      setUser(null);
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  // Exibe um indicador de carregamento durante a verificação inicial
  // não durante as operações de login/logout
  if (loading && !user && !localStorage.getItem('access_token')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Fornece o contexto para os componentes filhos
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto de autenticação
 * 
 * Exemplo de uso:
 * ```
 * const { user, loading, login, logout } = useAuth();
 * ```
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