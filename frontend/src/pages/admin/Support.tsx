/**
 * Página de Suporte Técnico
 * 
 * Esta página exibe informações de suporte técnico para administradores,
 * incluindo logs do sistema, métricas, status dos serviços e problemas reportados.
 */
import React, { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { mockSupportApi } from '@/mocks/support';
import { 
  SystemLog, 
  ServiceStatus, 
  ReportedProblem, 
  Metrics 
} from '@/types/support';

type TabType = 'logs' | 'metrics' | 'status' | 'problems';

export default function Support() {
  const [activeTab, setActiveTab] = useState<TabType>('logs');
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [problems, setProblems] = useState<ReportedProblem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Busca dados mockados
      const [logs, servicesStatus, reportedProblems, metricsData] = await Promise.all([
        mockSupportApi.getSystemLogs(),
        mockSupportApi.getServicesStatus(),
        mockSupportApi.getReportedProblems(),
        mockSupportApi.getMetrics()
      ]);

      setSystemLogs(logs);
      setServices(servicesStatus);
      setProblems(reportedProblems);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Erro ao buscar dados de suporte:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'down':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: ReportedProblem['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Suporte Técnico</h1>
        <button
          onClick={fetchData}
          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Atualizar
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'logs', name: 'Logs do Sistema' },
            { id: 'metrics', name: 'Métricas' },
            { id: 'status', name: 'Status dos Serviços' },
            { id: 'problems', name: 'Problemas Reportados' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          {/* System Logs */}
          {activeTab === 'logs' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalhes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {systemLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                  {systemLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Nenhum log encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Metrics */}
          {activeTab === 'metrics' && (
            <div className="p-6">
              {metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Usuários Ativos</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.activeUsers}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Requisições API (24h)</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.apiRequests}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Tempo Médio de Resposta</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.averageResponseTime}ms</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Taxa de Erro</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.errorRate}%</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Nenhuma métrica disponível
                </div>
              )}
            </div>
          )}

          {/* Service Status */}
          {activeTab === 'status' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serviço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Verificação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uptime
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(service.status)}`}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(service.lastChecked).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.uptime}%
                      </td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Nenhum serviço encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Reported Problems */}
          {activeTab === 'problems' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reportado Por
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {problems.map((problem) => (
                    <tr key={problem.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {problem.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(problem.priority)}`}>
                          {problem.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {problem.status.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {problem.reportedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(problem.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {problems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Nenhum problema reportado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}