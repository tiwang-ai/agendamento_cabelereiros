/**
 * Serviços Mockados para o Salão
 * 
 * Este arquivo fornece implementações simuladas dos serviços relacionados a salões
 * para desenvolvimento e testes sem depender de um backend real.
 */
import { 
  Salon, 
  Service, 
  Professional, 
  Client, 
  Appointment, 
  SalonUser 
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Dados mockados
const MOCK_SALON_USERS: SalonUser[] = [
  {
    id: 'su-1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    phone: '(11) 98765-4321',
    role: 'owner',
    active: true,
    salon_id: 'salon-123'
  },
  {
    id: 'su-2',
    name: 'Maria Souza',
    email: 'maria@exemplo.com',
    phone: '(11) 91234-5678',
    role: 'professional',
    active: true,
    salon_id: 'salon-123'
  },
  {
    id: 'su-3',
    name: 'Ana Oliveira',
    email: 'ana@exemplo.com',
    phone: '(11) 99999-8888',
    role: 'receptionist',
    active: true,
    salon_id: 'salon-123'
  }
];

/**
 * Adiciona um atraso simulado para imitar chamadas de rede
 */
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Serviços mockados para salão
 */
export const mockSalonService = {
  // Métodos para usuários do salão (área administrativa)
  async getSalonUsers(salonId: string): Promise<SalonUser[]> {
    await delay();
    return MOCK_SALON_USERS.filter(user => user.salon_id === salonId);
  },

  async createSalonUser(salonId: string, userData: Omit<SalonUser, 'id' | 'salon_id'>): Promise<SalonUser | null> {
    await delay();
    
    const newUser: SalonUser = {
      id: `su-${uuidv4().slice(0, 8)}`,
      salon_id: salonId,
      ...userData
    };
    
    MOCK_SALON_USERS.push(newUser);
    return newUser;
  },

  async updateSalonUser(salonId: string, userId: string, userData: Partial<SalonUser>): Promise<SalonUser | null> {
    await delay();
    
    const userIndex = MOCK_SALON_USERS.findIndex(u => u.id === userId && u.salon_id === salonId);
    
    if (userIndex === -1) {
      console.error('Usuário não encontrado');
      return null;
    }
    
    MOCK_SALON_USERS[userIndex] = {
      ...MOCK_SALON_USERS[userIndex],
      ...userData
    };
    
    return MOCK_SALON_USERS[userIndex];
  },

  async deleteSalonUser(salonId: string, userId: string): Promise<boolean> {
    await delay();
    
    const userIndex = MOCK_SALON_USERS.findIndex(u => u.id === userId && u.salon_id === salonId);
    
    if (userIndex === -1) {
      console.error('Usuário não encontrado');
      return false;
    }
    
    MOCK_SALON_USERS[userIndex].active = false;
    return true;
  }
}; 