/**
 * Tipos relacionados a pessoas no sistema (profissionais e clientes)
 */

/**
 * Profissional que trabalha em um salão
 */
export interface Professional {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  salon_id: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  services?: string[]; // IDs dos serviços que o profissional realiza
  avatar_url?: string;
  bio?: string;
}

/**
 * Cliente de um salão
 */
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  salon_id: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  address?: string;
  birthdate?: string;
  favorite_professionals?: string[]; // IDs dos profissionais favoritos
  last_appointment?: string; // Data do último agendamento
}

/**
 * Histórico de cliente
 */
export interface ClientHistory {
  id: string;
  client_id: string;
  appointment_id: string;
  notes: string;
  created_at: string;
  created_by: string;
  professional_id?: string;
  service_id?: string;
}

/**
 * Disponibilidade de um profissional
 */
export interface ProfessionalAvailability {
  id: string;
  professional_id: string;
  day_of_week: number; // 0-6, onde 0 é domingo
  start_time: string; // Formato: HH:MM
  end_time: string; // Formato: HH:MM
  is_available: boolean;
}

/**
 * Exceção na disponibilidade (férias, folga, etc)
 */
export interface AvailabilityException {
  id: string;
  professional_id: string;
  date: string; // YYYY-MM-DD
  start_time?: string; // Formato: HH:MM
  end_time?: string; // Formato: HH:MM
  is_available: boolean;
  reason?: string;
} 