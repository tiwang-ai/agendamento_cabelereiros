/**
 * Tipos relacionados à autenticação e usuários
 */

/**
 * Enum para os tipos de papéis de usuário no sistema
 */
export enum UserRole {
  ADMIN = 'admin',
  SALON_OWNER = 'salon_owner',
  PROFESSIONAL = 'professional',
  RECEPTIONIST = 'receptionist'
}

/**
 * Representa um usuário autenticado no sistema
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
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
  phone?: string;
} 