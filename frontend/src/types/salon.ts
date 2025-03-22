/**
 * Tipos relacionados aos salões no sistema
 */

/**
 * Enum para os tipos de usuário do salão
 */
export enum UserRole {
  /** Administrador do sistema */
  ADMIN = 'admin',
  
  /** Proprietário do salão */
  OWNER = 'owner',
  
  /** Profissional do salão */
  PROFESSIONAL = 'professional',
  
  /** Recepcionista do salão */
  RECEPTIONIST = 'receptionist'
}

/**
 * Representa um salão no sistema
 */
export interface Salon {
  /** Identificador único do salão */
  id: string;
  
  /** Nome do salão */
  name: string;
  
  /** ID do proprietário do salão */
  owner_id: string;
  
  /** Endereço completo do salão */
  address: string | null;
  
  /** Lista de telefones de contato */
  phones: string[] | null;
  
  /** Indica se o salão está ativo no sistema */
  active: boolean;
}

/**
 * Props do componente SalonForm
 */
export interface SalonFormProps {
  /** Salão existente para edição (opcional) */
  salon?: Salon | null;
  
  /** Callback chamado ao fechar o formulário */
  onClose: () => void;
  
  /** Callback chamado após salvar com sucesso */
  onSuccess: () => void;
}

/**
 * Dados do formulário de salão
 */
export interface SalonFormData {
  /** Nome do salão */
  name: string;
  
  /** Endereço do salão */
  address: string;
  
  /** Email do proprietário (apenas na criação) */
  ownerEmail?: string;
}

/**
 * Tipos relacionados a Salões
 */

export enum SalonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

/**
 * Serviço oferecido por um salão
 */
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  salon_id: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Usuário de um salão com permissões específicas
 */
export interface SalonUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'owner' | 'professional' | 'receptionist';
  active: boolean;
  salon_id: string;
}

/**
 * Configurações de funcionamento do salão
 */
export interface SalonSettings {
  id: string;
  salon_id: string;
  business_hours: BusinessHours;
  appointment_interval: number; // Em minutos
  notification_settings: NotificationSettings;
  active: boolean;
}

/**
 * Horários de funcionamento do salão
 */
export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

/**
 * Horários de um dia específico
 */
export interface DaySchedule {
  isOpen: boolean;
  openTime?: string; // Formato: HH:MM
  closeTime?: string; // Formato: HH:MM
  breaks?: BreakTime[];
}

/**
 * Intervalos de pausa durante o dia
 */
export interface BreakTime {
  start: string; // Formato: HH:MM
  end: string; // Formato: HH:MM
}

/**
 * Configurações de notificação do salão
 */
export interface NotificationSettings {
  sendAppointmentConfirmation: boolean;
  sendAppointmentReminder: boolean;
  reminderTimeBeforeAppointment: number; // Em horas
  sendCancellationNotification: boolean;
  sendFollowUpAfterAppointment: boolean;
  followUpTimeAfterAppointment: number; // Em horas
}

/**
 * Props do formulário de usuário do salão
 */
export interface SalonUserFormProps {
  /** Usuário existente para edição (opcional) */
  user?: SalonUser | null;
  
  /** ID do salão ao qual o usuário será vinculado */
  salonId: string;
  
  /** Callback chamado ao fechar o formulário */
  onClose: () => void;
  
  /** Callback chamado após salvar com sucesso */
  onSuccess: () => void;
}

/**
 * Dados do formulário de usuário do salão
 */
export interface SalonUserFormData {
  /** Nome do usuário */
  name: string;
  
  /** Email do usuário */
  email: string;
  
  /** Telefone do usuário (opcional) */
  phone?: string;
  
  /** Tipo de permissão do usuário */
  role: UserRole;
} 