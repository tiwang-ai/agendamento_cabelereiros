/**
 * Serviços de Salão
 * 
 * Este arquivo define as funções de comunicação com o servidor relacionadas a salões.
 * Suporta dois modos de operação:
 * 1. Mock: Utiliza dados simulados para desenvolvimento e testes
 * 2. API Real: Conecta a uma API REST real
 */
import api from '@/lib/axios';
import { 
  Salon, 
  Service, 
  Professional, 
  Client, 
  Appointment, 
  SalonUser 
} from '@/types';
import { mockSalonService } from './mockSalon';

/**
 * Define se deve usar dados mockados ou API real
 * Em ambiente de produção, deve ser sempre false
 */
const USE_MOCK_DATA = true;

// Serviço de salão
export const salonService = {
  // Métodos para salões
  async getSalonByOwnerId(): Promise<Salon | null> {
    try {
      if (USE_MOCK_DATA) {
        // Implementação pendente
        console.log('Mock getSalonByOwnerId não implementado');
        return null;
      }
      
      const response = await api.get('/api/salon/my-salon/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar salão:', error);
      return null;
    }
  },

  // Métodos para serviços
  async getServices(): Promise<Service[]> {
    try {
      if (USE_MOCK_DATA) {
        // Implementação pendente
        console.log('Mock getServices não implementado');
        return [];
      }
      
      const response = await api.get('/api/salon/services/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      return [];
    }
  },

  async createService(serviceData: Omit<Service, 'id' | 'salon_id'>): Promise<Service | null> {
    try {
      if (USE_MOCK_DATA) {
        // Implementação pendente
        console.log('Mock createService não implementado');
        return null;
      }
      
      const response = await api.post('/api/salon/services/', serviceData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      return null;
    }
  },

  async updateService(id: string, serviceData: Partial<Service>): Promise<Service | null> {
    try {
      if (USE_MOCK_DATA) {
        // Implementação pendente
        console.log('Mock updateService não implementado');
        return null;
      }
      
      const response = await api.put(`/api/salon/services/${id}/`, serviceData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      return null;
    }
  },

  async deleteService(id: string): Promise<boolean> {
    try {
      if (USE_MOCK_DATA) {
        // Implementação pendente
        console.log('Mock deleteService não implementado');
        return false;
      }
      
      await api.patch(`/api/salon/services/${id}/`, { active: false });
      return true;
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
      return false;
    }
  },

  // Métodos para profissionais
  async getProfessionals(): Promise<Professional[]> {
    try {
      const response = await api.get('/api/salon/professionals/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      return [];
    }
  },

  async createProfessional(professionalData: Omit<Professional, 'id' | 'salon_id'>): Promise<Professional | null> {
    try {
      const response = await api.post('/api/salon/professionals/', professionalData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      return null;
    }
  },

  async updateProfessional(id: string, professionalData: Partial<Professional>): Promise<Professional | null> {
    try {
      const response = await api.put(`/api/salon/professionals/${id}/`, professionalData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      return null;
    }
  },

  async deleteProfessional(id: string): Promise<boolean> {
    try {
      await api.patch(`/api/salon/professionals/${id}/`, { active: false });
      return true;
    } catch (error) {
      console.error('Erro ao remover profissional:', error);
      return false;
    }
  },

  // Métodos para clientes
  async getClients(): Promise<Client[]> {
    try {
      const response = await api.get('/api/salon/clients/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  },

  async createClient(clientData: Omit<Client, 'id' | 'salon_id'>): Promise<Client | null> {
    try {
      const response = await api.post('/api/salon/clients/', clientData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return null;
    }
  },

  async updateClient(id: string, clientData: Partial<Client>): Promise<Client | null> {
    try {
      const response = await api.put(`/api/salon/clients/${id}/`, clientData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return null;
    }
  },

  async deleteClient(id: string): Promise<boolean> {
    try {
      await api.delete(`/api/salon/clients/${id}/`);
      return true;
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      return false;
    }
  },

  // Métodos para agendamentos
  async getAppointments(): Promise<Appointment[]> {
    try {
      const response = await api.get('/api/salon/appointments/');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }
  },

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'salon_id' | 'client' | 'professional' | 'service'>): Promise<Appointment | null> {
    try {
      const response = await api.post('/api/salon/appointments/', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      return null;
    }
  },

  async updateAppointment(id: string, appointmentData: Partial<Appointment>): Promise<Appointment | null> {
    try {
      const response = await api.put(`/api/salon/appointments/${id}/`, appointmentData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return null;
    }
  },

  async cancelAppointment(id: string): Promise<boolean> {
    try {
      await api.patch(`/api/salon/appointments/${id}/`, { status: 'cancelled' });
      return true;
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      return false;
    }
  },

  // Métodos para usuários do salão (área administrativa)
  async getSalonUsers(salonId: string): Promise<SalonUser[]> {
    try {
      if (USE_MOCK_DATA) {
        return await mockSalonService.getSalonUsers(salonId);
      }
      
      const response = await api.get(`/api/admin/salons/${salonId}/users/`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários do salão:', error);
      return [];
    }
  },

  async createSalonUser(salonId: string, userData: Omit<SalonUser, 'id' | 'salon_id'>): Promise<SalonUser | null> {
    try {
      if (USE_MOCK_DATA) {
        return await mockSalonService.createSalonUser(salonId, userData);
      }
      
      const response = await api.post(`/api/admin/salons/${salonId}/users/`, userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário do salão:', error);
      return null;
    }
  },

  async updateSalonUser(salonId: string, userId: string, userData: Partial<SalonUser>): Promise<SalonUser | null> {
    try {
      if (USE_MOCK_DATA) {
        return await mockSalonService.updateSalonUser(salonId, userId, userData);
      }
      
      const response = await api.put(`/api/admin/salons/${salonId}/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário do salão:', error);
      return null;
    }
  },

  async deleteSalonUser(salonId: string, userId: string): Promise<boolean> {
    try {
      if (USE_MOCK_DATA) {
        return await mockSalonService.deleteSalonUser(salonId, userId);
      }
      
      await api.patch(`/api/admin/salons/${salonId}/users/${userId}/`, { active: false });
      return true;
    } catch (error) {
      console.error('Erro ao remover usuário do salão:', error);
      return false;
    }
  }
}; 