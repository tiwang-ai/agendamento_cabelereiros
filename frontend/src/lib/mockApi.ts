// Dados simulados para agendamentos
const mockAppointments = [
  {
    id: '1',
    client: { name: 'João Silva' },
    service: { name: 'Corte de Cabelo' },
    professional: { name: 'Maria Oliveira' },
    start_time: '2024-03-20T10:00:00',
    end_time: '2024-03-20T11:00:00',
    status: 'confirmed'
  },
  {
    id: '2',
    client: { name: 'Ana Santos' },
    service: { name: 'Coloração' },
    professional: { name: 'Maria Oliveira' },
    start_time: '2024-03-20T14:00:00',
    end_time: '2024-03-20T16:00:00',
    status: 'confirmed'
  }
] as const;

// Dados simulados para salões
const mockSalons = [
  {
    id: '1',
    name: 'Salão Beleza Total',
    owner_id: 'user1',
    created_at: '2024-01-01T00:00:00'
  }
] as const;

// Dados simulados para clientes
const mockClients = [
  {
    id: '1',
    name: 'João Silva',
    phone: '11999999999',
    email: 'joao@email.com',
    created_at: '2024-01-01T00:00:00',
    salon_id: '1'
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '11988888888',
    email: 'maria@email.com',
    created_at: '2024-01-02T00:00:00',
    salon_id: '1'
  }
] as const;

export const mockApi = {
  // Busca detalhes de um agendamento específico
  getAppointmentDetails: async (appointmentId: string) => {
    const appointment = mockAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return appointment;
  },

  // Busca todos os agendamentos de um profissional
  getProfessionalAppointments: async (professionalId: string) => {
    // No ambiente de mock, retornamos todos os agendamentos
    // Em produção, filtraríamos pelo professional_id
    return mockAppointments;
  },

  // Cancela um agendamento
  cancelAppointment: async (appointmentId: string) => {
    // Simula o cancelamento do agendamento
    // Em produção, isso atualizaria o status no banco de dados
    return { success: true };
  },

  // Busca um salão pelo ID do proprietário
  getSalonByOwnerId: async (ownerId: string) => {
    const salon = mockSalons.find(s => s.owner_id === ownerId);
    if (!salon) {
      throw new Error('Salon not found');
    }
    return salon;
  },

  // Busca todos os clientes de um salão
  getClientsBySalonId: async (salonId: string) => {
    return mockClients
      .filter(c => c.salon_id === salonId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // Adiciona um novo cliente
  addClient: async (clientData: Omit<typeof mockClients[0], 'id' | 'created_at'>) => {
    // Em produção, isso criaria um novo cliente no banco de dados
    return {
      ...clientData,
      id: String(mockClients.length + 1),
      created_at: new Date().toISOString()
    };
  },

  // Atualiza um cliente existente
  updateClient: async (clientId: string, clientData: Partial<typeof mockClients[0]>) => {
    // Em produção, isso atualizaria o cliente no banco de dados
    return { success: true };
  }
}; 