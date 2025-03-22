/**
 * Tipos relacionados a Salões
 */

export enum SalonStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

/**
 * Representa um salão de cabeleireiro
 */
export interface Salon {
  id: string;
  name: string;
  owner_id: string;
  address: string;
  phones: string[];
  active: boolean;
  created_at: string;
  status?: SalonStatus;
  subscription_active?: boolean;
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