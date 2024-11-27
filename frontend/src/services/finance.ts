// src/services/finance.ts
import api from './api';

export interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  activeSubscriptions: number;
}

export interface SalonStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  totalAppointments: number;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'cancelled';
  category?: string;
}

export const FinanceService = {
  // Admin/Staff endpoints
  getAdminStats: async (): Promise<FinanceStats> => {
    const response = await api.get('/admin/finance/stats/');
    return response.data;
  },

  getAdminTransactions: async (filters?: any): Promise<Transaction[]> => {
    const response = await api.get('/admin/finance/transactions/', { params: filters });
    return response.data;
  },

  // Salon endpoints
  getSalonStats: async (): Promise<SalonStats> => {
    const response = await api.get('/finance/salon/stats/');
    return response.data;
  },

  getSalonTransactions: async (filters?: any): Promise<Transaction[]> => {
    const response = await api.get('/finance/salon/transactions/', { params: filters });
    return response.data;
  }
};