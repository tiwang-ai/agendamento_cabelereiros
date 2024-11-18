// src/components/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserRole } from '../types/auth'

interface PrivateRouteProps {
  roles?: UserRole[]
}

const PrivateRoute = ({ roles }: PrivateRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth()
  
  if (loading) {
    return <div>Carregando...</div> // Você pode criar um componente de loading mais elaborado
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user?.role as UserRole)) {
    // Redirecionar para página apropriada baseado no role
    if (user?.role === UserRole.OWNER) {
      return <Navigate to="/dashboard" replace />
    }
    if (user?.role === UserRole.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default PrivateRoute