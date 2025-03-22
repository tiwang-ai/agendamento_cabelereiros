/**
 * Tipos relacionados à autenticação e permissões
 */

/**
 * Enum para os tipos de papéis de usuário no sistema
 */
export enum UserRole {
  SUPERUSER = 'SUPERUSER',
  ADMIN = 'ADMIN',
  SALON_OWNER = 'SALON_OWNER',
  PROFESSIONAL = 'PROFESSIONAL',
  RECEPTIONIST = 'RECEPTIONIST',
}

/**
 * Representa um usuário autenticado no sistema
 */
export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  permissions: string[];
}

/**
 * Representa um usuário administrador do sistema
 * com permissões específicas
 */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'support' | 'financial' | 'technical';
}

/**
 * Resposta da API após autenticação bem-sucedida
 */
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Credenciais para login de usuário
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Dados para registro de um novo usuário
 */
export interface RegisterData extends LoginCredentials {
  name: string;
  role?: UserRole;
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

// Permissões específicas para cada role
export const RolePermissions: Record<UserRole, string[]> = {
  SUPERUSER: [
    'manage:all',
    'manage:admins',
    'manage:salons',
    'manage:plans',
    'manage:bot',
    'view:metrics',
    'manage:support'
  ],
  ADMIN: [
    'manage:salons',
    'manage:plans',
    'view:metrics',
    'manage:support'
  ],
  SALON_OWNER: [
    'manage:own_salon',
    'manage:professionals',
    'manage:services',
    'view:own_metrics',
    'manage:appointments'
  ],
  PROFESSIONAL: [
    'manage:own_schedule',
    'view:own_appointments',
    'manage:own_clients'
  ],
  RECEPTIONIST: [
    'manage:appointments',
    'view:salon_schedule',
    'manage:clients'
  ]
}; 