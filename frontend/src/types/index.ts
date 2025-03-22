/**
 * Arquivo central de tipos - Ponto de entrada para todos os tipos do sistema
 * 
 * Este arquivo serve como um agregador centralizado para definições de tipos TypeScript.
 * A abordagem utilizada no projeto é:
 * 
 * 1. Definir tipos específicos por domínio em arquivos separados (auth.ts, salon.ts, etc.)
 * 2. Importar e reexportá-los neste arquivo
 * 3. Importar esses tipos nos componentes utilizando 'import { TipoX } from '@/types'
 * 
 * Isso traz os seguintes benefícios:
 * - Organização mais clara por domínio
 * - Facilidade de manutenção
 * - Evita problemas de importação circular
 * - Permite importar todos os tipos de um só lugar
 * 
 * Durante a refatoração, mantemos as definições legadas neste arquivo para
 * compatibilidade com código existente, mas marcando como @deprecated.
 */

/**
 * Tipos centralizados da aplicação
 * 
 * Este arquivo define os tipos principais usados em toda a aplicação.
 * Cada tipo está documentado com sua finalidade e estrutura.
 */

// Exportamos todos os tipos específicos por domínio
// Isto permite importar qualquer tipo usando: import { TipoX } from '@/types'
export * from './auth';
export * from './salon';
export * from './people';
export * from './appointment';
export * from './whatsapp';

/**
 * AVISO: TIPOS LEGADOS
 * 
 * Os tipos abaixo são mantidos por compatibilidade com código existente.
 * Novos componentes devem importar os tipos dos arquivos específicos.
 * Durante refatoração, substitua gradualmente o uso destes tipos pelas versões
 * importadas diretamente dos módulos específicos.
 * 
 * Exemplo:
 * - Em vez de: import { User } from '@/types'
 * - Use: import { User } from '@/types/auth'
 */

/**
 * Tipos centralizados para o sistema de agendamento
 */

/**
 * Roles (Papéis/Funções) de usuários no sistema
 */
export enum UserRole {
  ADMIN = 'admin',
  SALON_OWNER = 'salon_owner',
  PROFESSIONAL = 'professional',
  RECEPTIONIST = 'receptionist',
  CLIENT = 'client',
}

/**
 * Usuário autenticado
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string | null;
  salon_id?: string | null;
  created_at: string;
}

/**
 * Dados do Salão
 */
export interface Salon {
  id: string;
  name: string;
  owner_id: string;
  address: string;
  phones: string[];
  logo_url?: string | null;
  active: boolean;
  created_at: string;
}

/**
 * Profissional do salão
 */
export interface Professional {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  salon_id: string;
  specialties: string[];
  color: string;
  active: boolean;
  created_at: string;
}

/**
 * Serviço oferecido pelo salão
 */
export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  salon_id: string;
  active: boolean;
  created_at: string;
}

/**
 * Cliente do salão
 */
export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  salon_id: string;
  observations: string | null;
  active: boolean;
  created_at: string;
}

/**
 * Status possíveis para um agendamento
 */
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  NO_SHOW = 'no_show',
}

/**
 * Agendamento
 */
export interface Appointment {
  id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  salon_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  observations: string | null;
  created_at: string;
  
  // Dados relacionados (expansões)
  client?: Client;
  professional?: Professional;
  service?: Service;
}

/**
 * Disponibilidade (horários disponíveis) de um profissional
 */
export interface Availability {
  id: string;
  professional_id: string;
  day_of_week: number; // 0 = Domingo, 1 = Segunda, ...
  start_time: string; // Formato HH:MM (24h)
  end_time: string; // Formato HH:MM (24h)
  is_available: boolean;
}

/**
 * Estatísticas do dashboard para proprietários de salão
 */
export interface DashboardStats {
  todaysAppointments: number;
  upcomingAppointments: number;
  activeClients: number;
  todaysRevenue: number;
}

/**
 * Estatísticas do dashboard para administradores do sistema
 */
export interface AdminDashboardStats {
  totalSalons: number;
  activeSalons: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
}

/**
 * Log de auditoria para administradores
 */
export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id: string;
  created_at: string;
}

// Tipos de autenticação
/**
 * @deprecated Use import da versão em './auth.ts'
 * Resposta da API após autenticação bem-sucedida
 */
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * @deprecated Use import da versão em './auth.ts'
 * Credenciais para login de usuário
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * @deprecated Use import da versão em './auth.ts'
 * Dados para registro de um novo usuário
 */
export interface RegisterData extends LoginCredentials {
  name: string;
}

// Tipos do salão
/**
 * @deprecated Use import da versão em './salon.ts'
 * Usuário de um salão com permissões específicas
 */
export interface SalonUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'owner' | 'professional' | 'receptionist';
  active: boolean;
  salon_id: string;
}

// Tipos de WhatsApp
/**
 * @deprecated Use import da versão em './whatsapp.ts'
 * Status de conexão do WhatsApp
 */
export interface WhatsAppStatus {
  status: string;
  qrCode?: string;
  batteryLevel?: number;
  lastSeen?: string;
  webhookUrl?: string;
  error?: string;
}

/**
 * @deprecated Use import da versão em './whatsapp.ts'
 * Log de evento do WhatsApp
 */
export interface WhatsAppLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warning';
} 