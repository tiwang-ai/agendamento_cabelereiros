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
 * Dados do Salão
 */
export interface Salon {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: WorkingHours[];
  services: Service[];
  professionals: Professional[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Profissional do salão
 */
export interface Professional {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  workingHours: WorkingHours[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Serviço oferecido pelo salão
 */
export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  active: boolean;
}

/**
 * Cliente do salão
 */
export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalVisits: number;
  preferredServices: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Status possíveis para um agendamento
 */
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Agendamento
 */
export interface Appointment {
  id: number;
  clientName: string;
  clientId: number;
  professionalId: number;
  professionalName: string;
  service: string;
  serviceId: number;
  date: string;
  time: string;
  duration: number;
  status: AppointmentStatus;
  value: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
} 