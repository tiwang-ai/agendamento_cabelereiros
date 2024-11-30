// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, JSXElementConstructor, ReactElement, ElementType, FC, PropsWithChildren, Component } from 'react';
import { User, UserRole } from '../types/auth';
import api from '../services/api';
import { Box } from '@mui/material';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  role: UserRole | null;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {
    throw new Error('login não implementado');
  },
  logout: () => {
    throw new Error('logout não implementado');
  },
  role: null
};

const AuthContext = createContext<AuthContextType>(defaultContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.email) {
          setUser(userData);
          setRole(userData.role as UserRole);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/api/auth/login/', { email, password });
    const { 
      access, 
      email: userEmail, 
      role: userRole, 
      name,
      estabelecimento_id,
      phone,
      id,
      is_active 
    } = response.data;
    
    const userData: User = { 
      id,
      email: userEmail, 
      role: userRole, 
      name,
      estabelecimento_id: estabelecimento_id?.toString(),
      phone,
      whatsappNumber: phone,
      isActive: is_active
    };
    localStorage.setItem('token', access);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    setUser(userData);
    setRole(userRole as UserRole);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    setRole(null);
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    role
  };

  return (
    <Box component={AuthContext.Provider} value={contextValue}>
      {children}
    </Box>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}