// src/services/finance.ts
import api from './api';

export interface FinanceStats {
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
  category: string;
}

export const FinanceService = {
  getSalonStats: async (): Promise<FinanceStats> => {
    const response = await api.get('/finance/salon/stats/');
    return response.data;
  },

  getSalonTransactions: async (params?: {
    start_date?: string;
    end_date?: string;
    type?: string;
    status?: string;
  }): Promise<Transaction[]> => {
    const response = await api.get('/finance/salon/transactions/', { params });
    return response.data;
  },

  // Para o painel administrativo
  getAdminStats: async (): Promise<FinanceStats> => {
    const response = await api.get('/admin/finance/stats/');
    return response.data;
  },

  getAdminTransactions: async (params?: {
    start_date?: string;
    end_date?: string;
    type?: string;
    status?: string;
  }): Promise<Transaction[]> => {
    const response = await api.get('/admin/finance/transactions/', { params });
    return response.data;
  }
};