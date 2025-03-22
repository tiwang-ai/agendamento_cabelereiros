/**
 * Dashboard Administrativo
 * 
 * Painel principal para administradores do sistema, exibindo estatísticas
 * sobre salões, assinaturas e receita, além de um log de atividades recentes.
 */
import React, { useState, useEffect } from 'react';
import { CurrencyDollarIcon, BuildingOfficeIcon, CheckBadgeIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

/**
 * Estatísticas gerais do sistema para administradores
 */
interface DashboardStats {
  totalSalons: number;
  activeSalons: number;
  activeSubscriptions: number;
  totalRevenue: number;
}

/**
 * Entrada no log de auditoria administrativa
 */
interface AuditLogEntry {
  id: string;
  created_at: string;
  action: string;
  table_name: string;
  admin_user_id: string;
  changes: any;
  admin_user?: {
    email: string;
  };
}

/**
 * Dados mockados para simular a resposta da API
 */
const MOCK_DATA = {
  salonsData: [
    { id: 'salon-1', active: true },
    { id: 'salon-2', active: true },
    { id: 'salon-3', active: false },
    { id: 'salon-4', active: true },
    { id: 'salon-5', active: true }
  ],
  subscriptionsData: [
    { id: 'sub-1', salon_id: 'salon-1', status: 'active', plan: { price: 99.90 } },
    { id: 'sub-2', salon_id: 'salon-2', status: 'active', plan: { price: 149.90 } },
    { id: 'sub-3', salon_id: 'salon-4', status: 'active', plan: { price: 99.90 } },
    { id: 'sub-4', salon_id: 'salon-5', status: 'active', plan: { price: 249.90 } }
  ],
  auditLogs: [
    {
      id: 'log-1',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      action: 'INSERT',
      table_name: 'salons',
      admin_user_id: 'admin-1',
      changes: { name: 'Novo Salão' },
      admin_user: { email: 'admin@example.com' }
    },
    {
      id: 'log-2',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      action: 'UPDATE',
      table_name: 'subscriptions',
      admin_user_id: 'admin-1',
      changes: { status: 'active' },
      admin_user: { email: 'admin@example.com' }
    },
    {
      id: 'log-3',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      action: 'UPDATE',
      table_name: 'salon_users',
      admin_user_id: 'admin-2',
      changes: { role: 'admin' },
      admin_user: { email: 'support@example.com' }
    }
  ]
};

/**
 * Componente principal do Dashboard Administrativo
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSalons: 0,
    activeSalons: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Simula a busca de dados do dashboard na API
     */
    const fetchDashboardData = async () => {
      try {
        // Simulando delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Usando dados mockados em vez de Supabase
        const salonsData = MOCK_DATA.salonsData;
        const subscriptionsData = MOCK_DATA.subscriptionsData;
        const logsData = MOCK_DATA.auditLogs;
        
        // Calcula estatísticas
        const totalSalons = salonsData.length;
        const activeSalons = salonsData.filter(salon => salon.active).length;
        const activeSubscriptions = subscriptionsData.length;
        const totalRevenue = subscriptionsData.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0);

        // Atualiza os estados
        setStats({
          totalSalons,
          activeSalons,
          activeSubscriptions,
          totalRevenue,
        });

        setAuditLogs(logsData);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Exibe loading enquanto os dados estão sendo carregados
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  /**
   * Formata um valor numérico como moeda brasileira
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  /**
   * Gera uma descrição legível para ações de auditoria
   */
  const getActionDescription = (action: string, tableName: string) => {
    const tableNames: Record<string, string> = {
      salons: 'Estabelecimento',
      subscriptions: 'Assinatura',
      subscription_plans: 'Plano',
      salon_users: 'Usuário',
    };

    const actions: Record<string, string> = {
      INSERT: 'criou',
      UPDATE: 'atualizou',
      DELETE: 'removeu',
    };

    const table = tableNames[tableName] || tableName;
    const actionVerb = actions[action] || action;

    return `${actionVerb} ${table}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total de Estabelecimentos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSalons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CheckBadgeIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Estabelecimentos Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeSalons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <DocumentCheckIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Assinaturas Ativas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Receita Total</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Log de atividades recentes */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Atividades Administrativas Recentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {auditLogs.map((log) => (
            <div key={log.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {log.admin_user?.email || 'Sistema'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getActionDescription(log.action, log.table_name)}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500">
              Nenhuma atividade recente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}