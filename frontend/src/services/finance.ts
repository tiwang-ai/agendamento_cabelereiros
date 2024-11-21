// src/services/finance.ts
import api from './api';

export interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  activeSubscriptions: number;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'cancelled';
  category: string;
  salon_id?: number;
}

export const FinanceService = {
  getStats: async (): Promise<FinanceStats> => {
    const response = await api.get('/admin/finance/stats/');
    return response.data;
  },

  getTransactions: async (params: {
    start_date?: string;
    end_date?: string;
    type?: string;
    status?: string;
  }): Promise<Transaction[]> => {
    const response = await api.get('/admin/finance/transactions/', { params });
    return response.data;
  }
};