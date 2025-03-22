/**
 * Dados Mockados Centralizados
 * 
 * Este arquivo centraliza todos os dados mockados do sistema.
 * Usado durante desenvolvimento enquanto não há integração com backend.
 */

import { User, Salon, Professional, Service, Client, Appointment, SalonUser } from '@/types';

// Salões mockados
export const MOCK_SALONS: Salon[] = [
  {
    id: 'salon-1',
    name: 'Belle Coiffeur',
    owner_id: 'owner-1',
    address: 'Rua das Flores, 123',
    phones: ['(11) 98765-4321'],
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  // ... outros salões
];

// Usuários mockados
export const MOCK_USERS: Record<string, User & { password: string }> = {
  admin: {
    id: '1',
    email: 'admin@example.com',
    name: 'Administrador',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    password: 'senha123'
  },
  owner: {
    id: '2',
    email: 'owner@example.com',
    name: 'Dono do Salão',
    role: 'salon_owner',
    created_at: '2024-01-01T00:00:00Z',
    password: 'senha123'
  }
  // ... outros usuários
};

// Usuários de salão mockados
export const MOCK_SALON_USERS: SalonUser[] = [
  {
    id: 'su-1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    phone: '(11) 98765-4321',
    role: 'owner',
    active: true,
    salon_id: 'salon-123'
  }
  // ... outros usuários de salão
];

// Função para gerar token fake
export const generateFakeToken = (user: User): string => {
  return `fake_token_${user.id}_${Date.now()}`;
};

// Função para simular delay de rede
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms)); 