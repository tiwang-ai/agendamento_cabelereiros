import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading, getInitialRoute } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!user) {
    console.log('PrivateRoute: Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // Se não houver roles específicos, permite acesso a qualquer usuário autenticado
  if (!allowedRoles) {
    console.log('PrivateRoute: Sem roles específicos, permitindo acesso');
    return <>{children}</>;
  }

  // Se o usuário não tiver o role necessário, redireciona para a rota inicial do seu role
  if (!allowedRoles.includes(user.role)) {
    console.log(`PrivateRoute: Usuário não tem permissão (${user.role}), redirecionando para rota inicial`);
    return <Navigate to={getInitialRoute()} replace />;
  }

  // Se passar por todas as verificações, renderiza o conteúdo
  console.log('PrivateRoute: Acesso permitido');
  return <>{children}</>;
}; 