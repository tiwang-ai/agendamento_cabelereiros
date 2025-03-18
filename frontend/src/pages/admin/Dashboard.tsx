import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CurrencyDollarIcon, BuildingOfficeIcon, CheckBadgeIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
  totalSalons: number;
  activeSalons: number;
  activeSubscriptions: number;
  totalRevenue: number;
}

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
    const fetchDashboardData = async () => {
      try {
        // Fetch salons statistics
        const { data: salonsData } = await supabase
          .from('salons')
          .select('id, active');
        
        const totalSalons = salonsData?.length || 0;
        const activeSalons = salonsData?.filter(salon => salon.active).length || 0;

        // Fetch subscriptions data
        const { data: subscriptionsData } = await supabase
          .from('subscriptions')
          .select(`
            *,
            plan:subscription_plans(price)
          `)
          .eq('status', 'active');

        const activeSubscriptions = subscriptionsData?.length || 0;
        const totalRevenue = subscriptionsData?.reduce((sum, sub) => sum + (sub.plan?.price || 0), 0) || 0;

        setStats({
          totalSalons,
          activeSalons,
          activeSubscriptions,
          totalRevenue,
        });

        // Fetch recent audit logs
        const { data: logsData } = await supabase
          .from('audit_logs')
          .select(`
            *,
            admin_user:admin_users(email)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        setAuditLogs(logsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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

      {/* Statistics Cards */}
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

      {/* Recent Activity */}
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