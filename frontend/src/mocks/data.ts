/**
 * Dados mockados centralizados para o sistema
 * 
 * Este arquivo contém dados simulados para uso durante o desenvolvimento
 * e testes, permitindo que a aplicação funcione sem um backend real.
 */

import { UserRole } from '@/types/auth';
import { 
  User, 
  Salon, 
  Professional, 
  Service, 
  Client, 
  Appointment, 
  AppointmentStatus,
  Availability,
  DashboardStats,
  AdminDashboardStats,
  AuditLogEntry,
  WhatsAppLog,
  SubscriptionPlan,
  SubscriptionHistory
} from '@/types';

/**
 * Salões mockados
 */
export const MOCK_SALONS: Salon[] = [
  {
    id: '1',
    name: 'Salão Exemplo',
    email: 'exemplo@salao.com',
    phone: '11999999999',
    address: 'Rua Exemplo, 123',
    city: 'São Paulo',
    state: 'SP',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Barbearia Estilo',
    owner_id: 'owner-2',
    address: 'Avenida Paulista, 1500, Bela Vista, São Paulo - SP',
    phones: ['(11) 3333-5555'],
    logo_url: null,
    active: true,
    created_at: '2023-02-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Espaço Beleza & Arte',
    owner_id: 'owner-3',
    address: 'Rua Augusta, 789, Consolação, São Paulo - SP',
    phones: ['(11) 3333-6666', '(11) 99999-7777'],
    logo_url: null,
    active: true,
    created_at: '2023-03-10T09:15:00Z',
  },
];

/**
 * Profissionais mockados
 */
export const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    phone: '11988888888',
    salon_id: '1',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@exemplo.com',
    phone: '(11) 95555-2345',
    salon_id: '1',
    specialties: ['Corte Masculino', 'Barba'],
    color: '#DC2626',
    active: true,
    created_at: '2023-01-18T10:45:00Z',
  },
  {
    id: '3',
    name: 'Beatriz Santos',
    email: 'beatriz.santos@exemplo.com',
    phone: '(11) 95555-3456',
    salon_id: '1',
    specialties: ['Manicure', 'Pedicure', 'Unhas em Gel'],
    color: '#7C3AED',
    active: true,
    created_at: '2023-02-05T09:20:00Z',
  },
  {
    id: '4',
    name: 'Marcelo Pereira',
    email: 'marcelo.pereira@exemplo.com',
    phone: '(11) 95555-4567',
    salon_id: '1',
    specialties: ['Corte Masculino', 'Barba', 'Coloração Masculina'],
    color: '#059669',
    active: true,
    created_at: '2023-02-10T14:15:00Z',
  },
  {
    id: '5',
    name: 'Lucas Mendes',
    email: 'lucas.mendes@exemplo.com',
    phone: '(11) 95555-5678',
    salon_id: '2',
    specialties: ['Corte Masculino', 'Barba', 'Tratamento Capilar'],
    color: '#2563EB',
    active: true,
    created_at: '2023-02-22T11:30:00Z',
  },
  {
    id: '6',
    name: 'Juliana Costa',
    email: 'juliana.costa@exemplo.com',
    phone: '(11) 95555-6789',
    salon_id: '3',
    specialties: ['Corte Feminino', 'Penteados', 'Maquiagem'],
    color: '#DB2777',
    active: true,
    created_at: '2023-03-12T13:45:00Z',
  },
];

/**
 * Serviços mockados
 */
export const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte',
    description: 'Corte de cabelo',
    duration: 30,
    price: 50.0,
    salon_id: '1',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Corte Feminino',
    description: 'Corte de cabelo feminino com finalização',
    price: 70.0,
    duration: 60,
    salon_id: '1',
    active: true,
    created_at: '2023-01-16T09:15:00Z',
  },
  {
    id: '3',
    name: 'Barba',
    description: 'Corte e modelagem de barba completo',
    price: 25.0,
    duration: 20,
    salon_id: '1',
    active: true,
    created_at: '2023-01-16T09:30:00Z',
  },
  {
    id: '4',
    name: 'Coloração',
    description: 'Serviço completo de coloração de cabelo',
    price: 120.0,
    duration: 90,
    salon_id: '1',
    active: true,
    created_at: '2023-01-17T10:00:00Z',
  },
  {
    id: '5',
    name: 'Hidratação',
    description: 'Tratamento de hidratação profunda',
    price: 80.0,
    duration: 45,
    salon_id: '1',
    active: true,
    created_at: '2023-01-17T10:30:00Z',
  },
  {
    id: '6',
    name: 'Corte Masculino',
    description: 'Corte masculino moderno',
    price: 40.0,
    duration: 30,
    salon_id: '2',
    active: true,
    created_at: '2023-02-21T09:00:00Z',
  },
  {
    id: '7',
    name: 'Barba Completa',
    description: 'Tratamento completo para barba com produtos especiais',
    price: 35.0,
    duration: 30,
    salon_id: '2',
    active: true,
    created_at: '2023-02-21T09:30:00Z',
  },
  {
    id: '8',
    name: 'Penteado',
    description: 'Penteado para eventos',
    price: 90.0,
    duration: 60,
    salon_id: '3',
    active: true,
    created_at: '2023-03-12T14:00:00Z',
  },
];

/**
 * Clientes mockados
 */
export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria@exemplo.com',
    phone: '11977777777',
    salon_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Mariana Costa',
    email: 'mariana.costa@exemplo.com',
    phone: '(11) 97777-2222',
    salon_id: '1',
    observations: null,
    active: true,
    created_at: '2023-01-22T10:15:00Z',
  },
  {
    id: '3',
    name: 'Felipe Santos',
    email: 'felipe.santos@exemplo.com',
    phone: '(11) 97777-3333',
    salon_id: '1',
    observations: 'Alérgico a alguns produtos de coloração',
    active: true,
    created_at: '2023-01-25T14:30:00Z',
  },
  {
    id: '4',
    name: 'Camila Pereira',
    email: 'camila.pereira@exemplo.com',
    phone: '(11) 97777-4444',
    salon_id: '1',
    observations: null,
    active: true,
    created_at: '2023-02-02T09:45:00Z',
  },
  {
    id: '5',
    name: 'Ricardo Oliveira',
    email: 'ricardo.oliveira@exemplo.com',
    phone: '(11) 97777-5555',
    salon_id: '2',
    observations: 'Cliente fidelidade',
    active: true,
    created_at: '2023-02-28T16:20:00Z',
  },
  {
    id: '6',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@exemplo.com',
    phone: '(11) 97777-6666',
    salon_id: '3',
    observations: 'Prefere ser atendida pela Juliana',
    active: true,
    created_at: '2023-03-15T11:10:00Z',
  },
];

/**
 * Agendamentos mockados
 */
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    client_id: '1',
    professional_id: '1',
    service_id: '1',
    salon_id: '1',
    date: new Date().toISOString(),
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    client_id: '2',
    professional_id: '1',
    service_id: '2',
    salon_id: '1',
    start_time: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(12, 0, 0, 0)).toISOString(),
    status: AppointmentStatus.SCHEDULED,
    observations: 'Cliente solicitou mechas mais claras',
    created_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    client: MOCK_CLIENTS.find(c => c.id === '2'),
    professional: MOCK_PROFESSIONALS.find(p => p.id === '1'),
    service: MOCK_SERVICES.find(s => s.id === '2'),
  },
  {
    id: '3',
    client_id: '3',
    professional_id: '2',
    service_id: '3',
    salon_id: '1',
    start_time: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    end_time: new Date(new Date().setHours(14, 20, 0, 0)).toISOString(),
    status: AppointmentStatus.SCHEDULED,
    observations: null,
    created_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    client: MOCK_CLIENTS.find(c => c.id === '3'),
    professional: MOCK_PROFESSIONALS.find(p => p.id === '2'),
    service: MOCK_SERVICES.find(s => s.id === '3'),
  },
  {
    id: '4',
    client_id: '4',
    professional_id: '1',
    service_id: '4',
    salon_id: '1',
    start_time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    end_time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    status: AppointmentStatus.SCHEDULED,
    observations: 'Primeira vez fazendo coloração',
    created_at: new Date(new Date().setDate(new Date().getDate() - 4)).toISOString(),
    client: MOCK_CLIENTS.find(c => c.id === '4'),
    professional: MOCK_PROFESSIONALS.find(p => p.id === '1'),
    service: MOCK_SERVICES.find(s => s.id === '4'),
  },
  {
    id: '5',
    client_id: '1',
    professional_id: '3',
    service_id: '5',
    salon_id: '1',
    start_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    end_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    status: AppointmentStatus.SCHEDULED,
    observations: null,
    created_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
    client: MOCK_CLIENTS.find(c => c.id === '1'),
    professional: MOCK_PROFESSIONALS.find(p => p.id === '3'),
    service: MOCK_SERVICES.find(s => s.id === '5'),
  },
];

/**
 * Disponibilidades dos profissionais
 */
export const MOCK_AVAILABILITIES: Availability[] = [
  // Profissional 1 (Ana Silva)
  {
    id: '1',
    professional_id: '1',
    day_of_week: 1, // Segunda
    start_time: '09:00',
    end_time: '18:00',
    is_available: true,
  },
  {
    id: '2',
    professional_id: '1',
    day_of_week: 2, // Terça
    start_time: '09:00',
    end_time: '18:00',
    is_available: true,
  },
  {
    id: '3',
    professional_id: '1',
    day_of_week: 3, // Quarta
    start_time: '09:00',
    end_time: '18:00',
    is_available: true,
  },
  {
    id: '4',
    professional_id: '1',
    day_of_week: 4, // Quinta
    start_time: '09:00',
    end_time: '18:00',
    is_available: true,
  },
  {
    id: '5',
    professional_id: '1',
    day_of_week: 5, // Sexta
    start_time: '09:00',
    end_time: '18:00',
    is_available: true,
  },
  {
    id: '6',
    professional_id: '1',
    day_of_week: 6, // Sábado
    start_time: '09:00',
    end_time: '14:00',
    is_available: true,
  },
  // Profissional 2 (Carlos Oliveira)
  {
    id: '7',
    professional_id: '2',
    day_of_week: 1, // Segunda
    start_time: '10:00',
    end_time: '19:00',
    is_available: true,
  },
  {
    id: '8',
    professional_id: '2',
    day_of_week: 2, // Terça
    start_time: '10:00',
    end_time: '19:00',
    is_available: true,
  },
  {
    id: '9',
    professional_id: '2',
    day_of_week: 3, // Quarta
    start_time: '10:00',
    end_time: '19:00',
    is_available: true,
  },
  {
    id: '10',
    professional_id: '2',
    day_of_week: 4, // Quinta
    start_time: '10:00',
    end_time: '19:00',
    is_available: true,
  },
  {
    id: '11',
    professional_id: '2',
    day_of_week: 5, // Sexta
    start_time: '10:00',
    end_time: '19:00',
    is_available: true,
  },
  {
    id: '12',
    professional_id: '2',
    day_of_week: 6, // Sábado
    start_time: '10:00',
    end_time: '16:00',
    is_available: true,
  },
];

/**
 * Usuários mockados
 */
export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'admin@sistema.com',
    name: 'Administrador',
    role: UserRole.ADMIN,
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'owner-1',
    email: 'dono1@exemplo.com',
    name: 'Pedro Oliveira',
    role: UserRole.SALON_OWNER,
    salon_id: '1',
    created_at: '2023-01-15T10:00:00Z',
  },
  {
    id: 'owner-2',
    email: 'dono2@exemplo.com',
    name: 'Roberto Santos',
    role: UserRole.SALON_OWNER,
    salon_id: '2',
    created_at: '2023-02-20T14:30:00Z',
  },
  {
    id: 'owner-3',
    email: 'dono3@exemplo.com',
    name: 'Marta Silva',
    role: UserRole.SALON_OWNER,
    salon_id: '3',
    created_at: '2023-03-10T09:15:00Z',
  },
  {
    id: 'prof-1',
    email: 'ana.silva@exemplo.com',
    name: 'Ana Silva',
    role: UserRole.PROFESSIONAL,
    salon_id: '1',
    created_at: '2023-01-16T08:30:00Z',
  },
  {
    id: 'prof-2',
    email: 'carlos.oliveira@exemplo.com',
    name: 'Carlos Oliveira',
    role: UserRole.PROFESSIONAL,
    salon_id: '1',
    created_at: '2023-01-18T10:45:00Z',
  },
  {
    id: 'recep-1',
    email: 'recepcao@exemplo.com',
    name: 'Juliana Recepção',
    role: UserRole.RECEPTIONIST,
    salon_id: '1',
    created_at: '2023-01-15T11:30:00Z',
  },
  {
    id: 'client-1',
    email: 'rodrigo.almeida@exemplo.com',
    name: 'Rodrigo Almeida',
    role: UserRole.CLIENT,
    created_at: '2023-01-20T15:40:00Z',
  },
];

/**
 * Gerar estatísticas do dashboard para o salão especificado
 * @param salonId ID do salão
 * @returns Estatísticas para o dashboard
 */
export const getMockDashboardStats = (salonId: string): DashboardStats => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaysAppointments = MOCK_APPOINTMENTS.filter(
    a => a.salon_id === salonId && 
      new Date(a.start_time).toDateString() === today.toDateString()
  ).length;
  
  const upcomingAppointments = MOCK_APPOINTMENTS.filter(
    a => a.salon_id === salonId && 
      new Date(a.start_time) > today &&
      (a.status === AppointmentStatus.SCHEDULED || a.status === AppointmentStatus.CONFIRMED)
  ).length;
  
  const activeClients = MOCK_CLIENTS.filter(
    c => c.salon_id === salonId && c.active
  ).length;
  
  // Calcular receita de hoje com base nos agendamentos completos
  const todaysRevenue = MOCK_APPOINTMENTS
    .filter(
      a => a.salon_id === salonId && 
        new Date(a.start_time).toDateString() === today.toDateString() &&
        a.status === AppointmentStatus.COMPLETED
    )
    .reduce((total, appointment) => {
      const service = MOCK_SERVICES.find(s => s.id === appointment.service_id);
      return total + (service?.price || 0);
    }, 0);
  
  return {
    todaysAppointments,
    upcomingAppointments,
    activeClients,
    todaysRevenue
  };
};

/**
 * Gerar estatísticas do dashboard para administradores
 * @returns Estatísticas para o dashboard administrativo
 */
export const getMockAdminDashboardStats = (): AdminDashboardStats => {
  const totalSalons = MOCK_SALONS.length;
  const activeSalons = MOCK_SALONS.filter(s => s.active).length;
  
  // Simula receita mensal (valor fixo para simulação)
  const monthlyRevenue = 15000;
  
  // Simula assinaturas ativas (todos os salões ativos são assinantes)
  const activeSubscriptions = activeSalons;
  
  return {
    totalSalons,
    activeSalons,
    activeSubscriptions,
    monthlyRevenue
  };
};

/**
 * Gera entradas de log de auditoria simuladas
 * @returns Lista de logs de auditoria
 */
export const getMockAuditLogs = (): AuditLogEntry[] => {
  return [
    {
      id: '1',
      user_id: 'admin-1',
      user_email: 'admin@sistema.com',
      action: 'create',
      resource: 'subscription_plan',
      resource_id: 'plan-1',
      created_at: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    },
    {
      id: '2',
      user_id: 'owner-1',
      user_email: 'dono1@exemplo.com',
      action: 'update',
      resource: 'salon',
      resource_id: '1',
      created_at: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    },
    {
      id: '3',
      user_id: 'admin-1',
      user_email: 'admin@sistema.com',
      action: 'activate',
      resource: 'subscription',
      resource_id: 'sub-1',
      created_at: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    },
    {
      id: '4',
      user_id: 'owner-2',
      user_email: 'dono2@exemplo.com',
      action: 'create',
      resource: 'salon',
      resource_id: '2',
      created_at: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    },
    {
      id: '5',
      user_id: 'admin-1',
      user_email: 'admin@sistema.com',
      action: 'update',
      resource: 'system_settings',
      resource_id: 'settings',
      created_at: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
    },
  ];
};

// Dados mockados para logs do WhatsApp
export const mockWhatsAppLogs: WhatsAppLog[] = [
  {
    id: '1',
    salon_id: '1',
    phone: '11999999999',
    message: 'Mensagem de teste',
    status: 'sent',
    created_at: new Date().toISOString()
  }
];

// Dados mockados para planos de assinatura
export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Plano Básico',
    description: 'Plano básico com recursos essenciais',
    price: 99.90,
    features: ['Agendamento online', 'Até 3 profissionais'],
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Dados mockados para histórico de assinaturas
export const mockSubscriptionHistory: SubscriptionHistory[] = [
  {
    id: '1',
    salon_id: '1',
    plan_id: '1',
    status: 'active',
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Funções auxiliares para simular operações de API
export const mockApi = {
  // Função genérica para simular delay de rede
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Funções para salões
  getSalon: async (id: string) => {
    await mockApi.delay(500);
    return MOCK_SALONS.find(salon => salon.id === id);
  },

  // Funções para serviços
  getServices: async (salonId: string) => {
    await mockApi.delay(500);
    return MOCK_SERVICES.filter(service => service.salon_id === salonId);
  },

  // Funções para profissionais
  getProfessionals: async (salonId: string) => {
    await mockApi.delay(500);
    return MOCK_PROFESSIONALS.filter(prof => prof.salon_id === salonId);
  },

  // Funções para clientes
  getClients: async (salonId: string) => {
    await mockApi.delay(500);
    return MOCK_CLIENTS.filter(client => client.salon_id === salonId);
  },

  // Funções para agendamentos
  getAppointments: async (salonId: string) => {
    await mockApi.delay(500);
    return MOCK_APPOINTMENTS.filter(apt => apt.salon_id === salonId);
  },

  // Funções para planos de assinatura
  getSubscriptionPlans: async () => {
    await mockApi.delay(500);
    return mockSubscriptionPlans;
  },

  getSubscriptionHistory: async (salonId: string) => {
    await mockApi.delay(500);
    return mockSubscriptionHistory.filter(sub => sub.salon_id === salonId);
  }
}; 