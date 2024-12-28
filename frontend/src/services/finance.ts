// src/services/finance.ts
import { Dayjs } from 'dayjs';

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

export interface FinanceFilters {
  startDate?: Dayjs;
  endDate?: Dayjs;
  type?: string;
  status?: string;
}

export const FinanceService = {
  // Admin/Staff endpoints
  getAdminStats: async (): Promise<FinanceStats> => {
    const response = await api.get('/api/admin/finance/stats/');
    return response.data;
  },

  getAdminTransactions: async (filters?: FinanceFilters): Promise<Transaction[]> => {
    const params = {
      start_date: filters?.startDate?.format('YYYY-MM-DD'),
      end_date: filters?.endDate?.format('YYYY-MM-DD'),
      type: filters?.type,
      status: filters?.status
    };

    const response = await api.get('/api/admin/finance/transactions/', { 
      params: {
        start_date: params.start_date,
        end_date: params.end_date,
        type: params.type,
        status: params.status
      }
    });
    return response.data;
  },

  // Salon endpoints
  getSalonStats: async (): Promise<SalonStats> => {
    const response = await api.get('/api/finance/salon/stats/');
    return response.data;
  },

  getSalonTransactions: async (filters?: FinanceFilters): Promise<Transaction[]> => {
    const params = {
      start_date: filters?.startDate?.format('YYYY-MM-DD'),
      end_date: filters?.endDate?.format('YYYY-MM-DD'),
      type: filters?.type,
      status: filters?.status
    };

    const response = await api.get('/api/finance/salon/transactions/', { params });
    return response.data;
  },

  getTransactions: async (filters?: FinanceFilters) => {
    const params = {
      start_date: filters?.startDate?.format('YYYY-MM-DD'),
      end_date: filters?.endDate?.format('YYYY-MM-DD'),
      type: filters?.type,
      status: filters?.status
    };

    const response = await api.get('/api/finance/transactions/', { params });
    return response.data;
  }
};