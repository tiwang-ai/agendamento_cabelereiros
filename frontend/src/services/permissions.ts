// frontend/src/services/permissions.ts
import { UserRole } from '../types/auth';
import api from './api';

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermissions {
  dashboard: Permission;
  appointments: Permission;
  professionals: Permission;
  clients: Permission;
  reports: Permission;
  settings: Permission;
  financials: Permission;
}

export const defaultPermissions: Record<UserRole, RolePermissions> = {
  [UserRole.ADMIN]: {
    dashboard: { view: true, create: true, edit: true, delete: true },
    appointments: { view: true, create: true, edit: true, delete: true },
    professionals: { view: true, create: true, edit: true, delete: true },
    clients: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true },
    settings: { view: true, create: true, edit: true, delete: true },
    financials: { view: true, create: true, edit: true, delete: true }
  },
  [UserRole.OWNER]: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    appointments: { view: true, create: true, edit: true, delete: true },
    professionals: { view: true, create: true, edit: true, delete: true },
    clients: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, create: false, edit: false, delete: false },
    settings: { view: true, create: false, edit: true, delete: false },
    financials: { view: true, create: true, edit: false, delete: false }
  },
  [UserRole.PROFESSIONAL]: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    appointments: { view: true, create: true, edit: true, delete: false },
    professionals: { view: false, create: false, edit: false, delete: false },
    clients: { view: true, create: true, edit: true, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
    financials: { view: false, create: false, edit: false, delete: false }
  },
  [UserRole.RECEPTIONIST]: {
    dashboard: { view: true, create: false, edit: false, delete: false },
    appointments: { view: true, create: true, edit: true, delete: false },
    professionals: { view: true, create: false, edit: false, delete: false },
    clients: { view: true, create: true, edit: true, delete: false },
    reports: { view: false, create: false, edit: false, delete: false },
    settings: { view: false, create: false, edit: false, delete: false },
    financials: { view: false, create: false, edit: false, delete: false }
  }
};

export const PermissionService = {
  getUserPermissions: async (userId: string) => {
    const response = await api.get(`/users/${userId}/permissions/`);
    return response.data;
  },

  updateUserPermissions: async (userId: string, permissions: RolePermissions) => {
    const response = await api.put(`/users/${userId}/permissions/`, permissions);
    return response.data;
  },

  hasPermission: (
    userRole: UserRole,
    module: keyof RolePermissions,
    action: keyof Permission
  ): boolean => {
    return defaultPermissions[userRole][module][action];
  }
};