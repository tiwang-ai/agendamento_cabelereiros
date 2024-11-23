// src/hooks/usePermissions.ts
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = {
    canManagePlans: user?.role === UserRole.ADMIN,
    canManageSalons: user?.role === UserRole.ADMIN,
    canManageUsers: user?.role === UserRole.ADMIN,
    canViewFinancials: [UserRole.ADMIN, UserRole.OWNER].includes(user?.role as UserRole),
    canManageServices: [UserRole.ADMIN, UserRole.OWNER].includes(user?.role as UserRole),
    canManageProfessionals: [UserRole.ADMIN, UserRole.OWNER].includes(user?.role as UserRole),
    canViewCalendar: [UserRole.ADMIN, UserRole.OWNER, UserRole.PROFESSIONAL, UserRole.RECEPTIONIST].includes(user?.role as UserRole),
    canManageWhatsApp: [UserRole.ADMIN, UserRole.OWNER].includes(user?.role as UserRole),
  };

  return permissions;
};