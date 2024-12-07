// src/components/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from '../hooks/usePermissions'
import { UserRole } from '../types/auth'

interface Props {
  roles?: UserRole[];
  role?: UserRole;
  module?: string;
  action?: 'view' | 'create' | 'edit' | 'delete';
}

const PrivateRoute = ({ roles, role, module, action = 'view' }: Props) => {
  const { user, isAuthenticated } = useAuth()
  const { checkPermission } = usePermissions()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (roles && !roles.includes(user?.role as UserRole)) {
    return <Navigate to="/" />
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" />
  }

  if (module && !checkPermission(module as any, action)) {
    return <Navigate to="/" />
  }

  return <Outlet />
}

export default PrivateRoute