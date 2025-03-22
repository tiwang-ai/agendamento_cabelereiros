import React, { createContext, useContext, useState } from 'react';
import { login as loginService, logout as logoutService } from '@/services/auth';
import { User } from '@/types';
import api from '@/lib/axios';

interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'support' | 'financial' | 'technical';
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  signInAdmin: (email: string, password: string) => Promise<{ error: string | null }>;
  signOutAdmin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminUser: null,
  signInAdmin: async () => ({ error: null }),
  signOutAdmin: () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const signInAdmin = async (email: string, password: string) => {
    try {
      // Tentar fazer login usando o backend Django
      const response = await loginService({ email, password });
      
      // Verificar se o usuário tem um papel administrativo
      if (!response.user || !isAdminRole(response.user.role)) {
        await logoutService();
        return { error: 'Credenciais administrativas inválidas ou usuário sem permissão de administração' };
      }

      // Converter o usuário para o formato AdminUser
      const adminUserData: AdminUser = {
        id: response.user.id,
        email: response.user.email,
        role: mapRoleToAdminRole(response.user.role)
      };

      // Atualizar o último login (se necessário)
      try {
        await api.post('/api/admin/login-tracking/');
      } catch (error) {
        console.warn('Erro ao registrar rastreamento de login admin:', error);
      }

      setAdminUser(adminUserData);
      return { error: null };

    } catch (error) {
      console.error('Erro durante o login administrativo:', error);
      return { error: 'Erro ao fazer login. Por favor, tente novamente.' };
    }
  };

  const signOutAdmin = async () => {
    await logoutService();
    setAdminUser(null);
  };

  // Funções auxiliares para verificar/mapear papéis
  const isAdminRole = (role: string): boolean => {
    return ['ADMIN', 'admin', 'super_admin', 'support', 'financial', 'technical'].includes(role);
  };

  const mapRoleToAdminRole = (role: string): 'super_admin' | 'support' | 'financial' | 'technical' => {
    // Mapeamento simples de roles do backend para roles administrativos
    switch (role.toLowerCase()) {
      case 'admin':
      case 'super_admin':
        return 'super_admin';
      case 'support':
        return 'support';
      case 'financial':
        return 'financial';
      default:
        return 'technical';
    }
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, signInAdmin, signOutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}