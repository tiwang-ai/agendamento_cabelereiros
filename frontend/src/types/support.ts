/**
 * Tipos para o módulo de suporte
 * 
 * Este arquivo define as interfaces e tipos utilizados no módulo de suporte.
 */

export interface SystemLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface ServiceStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down';
  lastChecked: string;
  uptime: number;
}

export interface ReportedProblem {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reportedBy: string;
  createdAt: string;
}

export interface Metrics {
  activeUsers: number;
  apiRequests: number;
  averageResponseTime: number;
  errorRate: number;
} 