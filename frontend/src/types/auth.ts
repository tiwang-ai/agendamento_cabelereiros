// src/types/auth.ts
export enum UserRole {
  ADMIN = 'ADMIN',           // Administrador do sistema
  OWNER = 'OWNER',          // Dono do salão
  PROFESSIONAL = 'PROFESSIONAL', // Profissional/Funcionário
  RECEPTIONIST = 'RECEPTIONIST' // Recepcionista
}

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
    dashboard: { view: true, create: true, edit: true, delete: false },
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
    clients: { view: true, create: false, edit: false, delete: false },
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  salonId?: string; // ID do salão associado
}