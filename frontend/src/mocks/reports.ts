/**
 * Dados mockados para relatórios
 * 
 * Este arquivo contém dados simulados para os diferentes tipos de relatórios
 * disponíveis no sistema administrativo.
 */

import { 
  Salon, 
  Subscription, 
  Appointment, 
  Client, 
  Service 
} from '@/types';

// Dados mockados de salões
export const getMockSalons = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      id: 'salon-1',
      name: 'Belle Coiffeur',
      owner_email: 'owner@bellecoiffeur.com'
    },
    {
      id: 'salon-2',
      name: 'Studio Hair',
      owner_email: 'owner@studiohair.com'
    }
  ];
};

// Dados mockados de assinaturas
export const getMockSubscriptions = async (startDate: string, endDate: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    {
      id: 'sub-1',
      salon_id: 'salon-1',
      status: 'active',
      current_period_start: '2024-03-01T00:00:00Z',
      current_period_end: '2024-03-31T23:59:59Z',
      canceled_at: null,
      salons: {
        name: 'Belle Coiffeur',
        owner_email: 'owner@bellecoiffeur.com'
      },
      subscription_plans: {
        name: 'Plano Premium',
        price: 199.90
      }
    }
  ];
};

// Dados mockados de agendamentos
export const getMockAppointments = async (salonId: string, startDate: string, endDate: string) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [
    {
      id: 'apt-1',
      start_time: '2024-03-15T10:00:00Z',
      end_time: '2024-03-15T11:00:00Z',
      status: 'completed',
      clients: {
        name: 'Maria Silva'
      },
      professionals: {
        name: 'João Cabeleireiro'
      },
      services: {
        name: 'Corte Feminino',
        price: 80.00
      }
    }
  ];
};

// Dados mockados de clientes
export const getMockClients = async (salonId: string, startDate: string, endDate: string) => {
  await new Promise(resolve => setTimeout(resolve, 700));
  return [
    {
      id: 'client-1',
      name: 'Maria Silva',
      email: 'maria@email.com',
      phone: '(11) 98765-4321',
      created_at: '2024-03-01T10:00:00Z',
      appointments: [
        { id: 'apt-1', status: 'completed' },
        { id: 'apt-2', status: 'cancelled' }
      ]
    }
  ];
};

// Dados mockados de serviços
export const getMockServices = async (salonId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {
      id: 'service-1',
      name: 'Corte Feminino',
      duration: 60,
      price: 80.00,
      appointments: [
        {
          id: 'apt-1',
          status: 'completed',
          start_time: '2024-03-15T10:00:00Z'
        }
      ]
    }
  ];
}; 