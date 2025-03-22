/**
 * Dados mockados para agendamentos
 * 
 * Este arquivo fornece dados simulados para agendamentos,
 * substituindo as chamadas que antes eram feitas ao Supabase.
 */
import { Appointment, Client, Professional, Service } from '@/types';

// Dados mockados de clientes
export const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Maria Silva',
    email: 'maria@example.com',
    phone: '11999999999',
    salon_id: 'salon-1',
    observations: null,
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'client-2',
    name: 'João Santos',
    email: 'joao@example.com',
    phone: '11988888888',
    salon_id: 'salon-1',
    observations: null,
    active: true,
    created_at: new Date().toISOString()
  }
];

// Dados mockados de profissionais
export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: 'prof-1',
    name: 'Ana Cabeleireira',
    email: 'ana@example.com',
    phone: '11977777777',
    salon_id: 'salon-1',
    specialties: ['Corte', 'Coloração'],
    color: '#4F46E5',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prof-2',
    name: 'Carlos Barbeiro',
    email: 'carlos@example.com',
    phone: '11966666666',
    salon_id: 'salon-1',
    specialties: ['Barba', 'Corte Masculino'],
    color: '#10B981',
    active: true,
    created_at: new Date().toISOString()
  }
];

// Dados mockados de serviços
export const MOCK_SERVICES: Service[] = [
  {
    id: 'service-1',
    name: 'Corte Feminino',
    description: 'Corte feminino com finalização',
    price: 80,
    duration: 60,
    salon_id: 'salon-1',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'service-2',
    name: 'Corte Masculino',
    description: 'Corte masculino tradicional',
    price: 40,
    duration: 30,
    salon_id: 'salon-1',
    active: true,
    created_at: new Date().toISOString()
  }
];

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
    created_at: new Date().toISOString()
  }
];

// Funções mockadas para simular operações de API
export const mockAppointmentService = {
  async getClients(salonId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CLIENTS.filter(client => client.salon_id === salonId);
  },

  async getProfessionals(salonId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PROFESSIONALS.filter(prof => prof.salon_id === salonId);
  },

  async getServices(salonId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_SERVICES.filter(service => service.salon_id === salonId);
  },

  async checkAvailability(startTime: Date, endTime: Date, professionalId: string, excludeAppointmentId?: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const conflictingAppointments = MOCK_APPOINTMENTS.filter(apt => 
      apt.professional_id === professionalId &&
      apt.status === 'CONFIRMED' &&
      apt.id !== excludeAppointmentId &&
      new Date(apt.end_time) > startTime &&
      new Date(apt.start_time) < endTime
    );
    
    return conflictingAppointments.length === 0;
  },

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'created_at'>) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newAppointment: Appointment = {
      ...appointmentData,
      id: `apt-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    
    MOCK_APPOINTMENTS.push(newAppointment);
    return newAppointment;
  },

  async updateAppointment(appointmentId: string, appointmentData: Partial<Appointment>) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const appointmentIndex = MOCK_APPOINTMENTS.findIndex(apt => apt.id === appointmentId);
    if (appointmentIndex === -1) return null;
    
    MOCK_APPOINTMENTS[appointmentIndex] = {
      ...MOCK_APPOINTMENTS[appointmentIndex],
      ...appointmentData
    };
    
    return MOCK_APPOINTMENTS[appointmentIndex];
  }
}; 