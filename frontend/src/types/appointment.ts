/**
 * Tipos relacionados a agendamentos
 */

/**
 * Status possíveis para um agendamento
 */
export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

/**
 * Agendamento de serviço
 */
export interface Appointment {
  id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  salon_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus | string;
  notes?: string;
  client: { name: string };
  professional: { name: string };
  service: { name: string; price?: number };
  created_at?: string;
  updated_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  confirmation_sent?: boolean;
  reminder_sent?: boolean;
}

/**
 * Dados para criação de um agendamento
 */
export interface AppointmentCreateData {
  client_id: string;
  professional_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

/**
 * Dados para atualização de um agendamento
 */
export interface AppointmentUpdateData {
  professional_id?: string;
  service_id?: string;
  start_time?: string;
  end_time?: string;
  status?: AppointmentStatus | string;
  notes?: string;
}

/**
 * Histórico de alterações em um agendamento
 */
export interface AppointmentHistory {
  id: string;
  appointment_id: string;
  changed_by: string;
  change_type: 'created' | 'updated' | 'cancelled' | 'completed' | 'status_change';
  previous_data?: Partial<Appointment>;
  new_data?: Partial<Appointment>;
  timestamp: string;
  notes?: string;
}

/**
 * Horário disponível para agendamento
 */
export interface AvailableTimeSlot {
  start_time: string;
  end_time: string;
  professional_id: string;
  professional_name: string;
} 