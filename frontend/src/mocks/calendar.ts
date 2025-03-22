/**
 * Dados mockados para o calendário
 * 
 * Este arquivo fornece dados simulados para o calendário,
 * substituindo as chamadas que antes eram feitas ao Supabase.
 */
import { Appointment } from '@/types';

// Dados mockados de agendamentos
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    client_id: 'client-1',
    professional_id: 'prof-1',
    service_id: 'service-1',
    salon_id: 'salon-1',
    start_time: new Date(new Date().setHours(10, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(11, 0, 0)).toISOString(),
    status: 'CONFIRMED',
    observations: null,
    created_at: new Date().toISOString(),
    client: {
      id: 'client-1',
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '11999999999',
      salon_id: 'salon-1',
      observations: null,
      active: true,
      created_at: new Date().toISOString()
    },
    professional: {
      id: 'prof-1',
      name: 'João Cabeleireiro',
      email: 'joao@example.com',
      phone: '11988888888',
      salon_id: 'salon-1',
      specialties: ['Corte', 'Coloração'],
      color: '#4F46E5',
      active: true,
      created_at: new Date().toISOString()
    },
    service: {
      id: 'service-1',
      name: 'Corte Feminino',
      description: 'Corte feminino com finalização',
      price: 80,
      duration: 60,
      salon_id: 'salon-1',
      active: true,
      created_at: new Date().toISOString()
    }
  }
];

// Funções mockadas para simular operações de API
export const mockCalendarService = {
  async getAppointments(salonId: string) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay de rede
    return MOCK_APPOINTMENTS.filter(apt => apt.salon_id === salonId);
  },

  async getAppointment(appointmentId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_APPOINTMENTS.find(apt => apt.id === appointmentId) || null;
  },

  async updateAppointmentStatus(appointmentId: string, status: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const appointment = MOCK_APPOINTMENTS.find(apt => apt.id === appointmentId);
    if (appointment) {
      appointment.status = status as any;
      return true;
    }
    return false;
  }
}; 