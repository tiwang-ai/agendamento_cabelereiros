/**
 * Dados mockados para o módulo de suporte
 * 
 * Este arquivo contém dados simulados para o módulo de suporte,
 * substituindo as chamadas que antes eram feitas ao Supabase.
 */

import { 
  SystemLog, 
  ServiceStatus, 
  ReportedProblem, 
  Metrics 
} from '@/types/support';

// Logs do sistema mockados
export const MOCK_SYSTEM_LOGS: SystemLog[] = [
  {
    id: '1',
    action: 'Criação de Salão',
    user: 'admin@example.com',
    timestamp: new Date().toISOString(),
    details: JSON.stringify({ salon_id: '123', name: 'Novo Salão' })
  },
  {
    id: '2',
    action: 'Atualização de Serviço',
    user: 'owner@example.com',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: JSON.stringify({ service_id: '456', price: 50.00 })
  }
];

// Status dos serviços mockados
export const MOCK_SERVICES_STATUS: ServiceStatus[] = [
  {
    id: '1',
    name: 'API Principal',
    status: 'operational',
    lastChecked: new Date().toISOString(),
    uptime: 99.98
  },
  {
    id: '2',
    name: 'Serviço de Email',
    status: 'degraded',
    lastChecked: new Date().toISOString(),
    uptime: 98.5
  },
  {
    id: '3',
    name: 'WhatsApp Integration',
    status: 'operational',
    lastChecked: new Date().toISOString(),
    uptime: 99.9
  }
];

// Problemas reportados mockados
export const MOCK_REPORTED_PROBLEMS: ReportedProblem[] = [
  {
    id: '1',
    title: 'Erro ao criar agendamento',
    description: 'Usuários relatam erro 500 ao tentar criar novos agendamentos',
    status: 'open',
    priority: 'high',
    reportedBy: 'salon1@example.com',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Lentidão no calendário',
    description: 'O calendário está demorando para carregar',
    status: 'in_progress',
    priority: 'medium',
    reportedBy: 'salon2@example.com',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Métricas mockadas
export const MOCK_METRICS: Metrics = {
  activeUsers: 156,
  apiRequests: 15789,
  averageResponseTime: 245,
  errorRate: 0.8
};

// Função para simular delay de rede
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// API mockada
export const mockSupportApi = {
  async getSystemLogs(): Promise<SystemLog[]> {
    await delay();
    return MOCK_SYSTEM_LOGS;
  },

  async getServicesStatus(): Promise<ServiceStatus[]> {
    await delay();
    return MOCK_SERVICES_STATUS;
  },

  async getReportedProblems(): Promise<ReportedProblem[]> {
    await delay();
    return MOCK_REPORTED_PROBLEMS;
  },

  async getMetrics(): Promise<Metrics> {
    await delay();
    return MOCK_METRICS;
  }
}; 