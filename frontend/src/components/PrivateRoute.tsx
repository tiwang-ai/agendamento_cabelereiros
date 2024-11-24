// src/components/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types/auth'

interface PrivateRouteProps {
  children?: React.ReactNode;
  roles?: UserRole[];
  role?: UserRole;
}

const PrivateRoute = ({ children, roles, role }: PrivateRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth()
  
  if (loading) {
    return <div>Carregando...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user?.role as UserRole)) {
    if (user?.role === UserRole.OWNER) {
      return <Navigate to="/dashboard" replace />
    }
    if (user?.role === UserRole.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children || <Outlet />}</>
}

export default PrivateRoute