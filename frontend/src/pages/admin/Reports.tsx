import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

type ReportType = 'appointments' | 'clients' | 'revenue' | 'services' | 'subscriptions';

interface ReportFilters {
  startDate: string;
  endDate: string;
  type: ReportType;
  salonId: string | null;
}

interface ReportData {
  [key: string]: any;
}

interface Salon {
  id: string;
  name: string;
  owner_email: string;
}

export default function Reports() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'appointments',
    salonId: null
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loadingSalons, setLoadingSalons] = useState(true);

  const reportTypes = [
    { value: 'appointments', label: 'Agendamentos' },
    { value: 'clients', label: 'Clientes' },
    { value: 'revenue', label: 'Receita' },
    { value: 'services', label: 'Serviços' },
    { value: 'subscriptions', label: 'Assinaturas' }
  ];

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const { data: salonsData, error: salonsError } = await supabase
          .from('salon_details')
          .select('id, name, owner_email')
          .order('name');

        if (salonsError) throw salonsError;
        setSalons(salonsData || []);
      } catch (error) {
        console.error('Error fetching salons:', error);
        setError('Erro ao carregar estabelecimentos');
      } finally {
        setLoadingSalons(false);
      }
    };

    fetchSalons();
  }, []);

  const generateReport = async () => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }
    
    if (!filters.salonId && filters.type !== 'subscriptions') {
      setError('Selecione um estabelecimento');
      return;
    }
    
    setLoading(true);
    setError(null);
    setData([]);
    
    try {
      let reportData: any[] = [];

      switch (filters.type) {
        case 'subscriptions': {
          const { data: subscriptions, error: subscriptionsError } = await supabase
            .from('subscriptions')
            .select(`
              id,
              salon_id,
              status,
              current_period_start,
              current_period_end,
              canceled_at,
              salons (
                name,
                owner_email
              ),
              subscription_plans (
                name,
                price
              )
            `)
            .gte('current_period_start', `${filters.startDate}T00:00:00`)
            .lte('current_period_start', `${filters.endDate}T23:59:59`);

          if (subscriptionsError) throw subscriptionsError;

          reportData = (subscriptions || []).map(sub => ({
            'Estabelecimento': sub.salons?.name || '-',
            'Email do Proprietário': sub.salons?.owner_email || '-',
            'Plano': sub.subscription_plans?.name || '-',
            'Valor': new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(sub.subscription_plans?.price || 0),
            'Status': sub.status === 'active' ? 'Ativa' :
                     sub.status === 'canceled' ? 'Cancelada' :
                     sub.status === 'past_due' ? 'Atrasada' : 'Não Paga',
            'Início do Período': new Date(sub.current_period_start).toLocaleDateString('pt-BR'),
            'Fim do Período': new Date(sub.current_period_end).toLocaleDateString('pt-BR'),
            'Data de Cancelamento': sub.canceled_at ? new Date(sub.canceled_at).toLocaleDateString('pt-BR') : '-'
          }));
          break;
        }

        case 'appointments': {
          const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select(`
              id,
              start_time,
              end_time,
              status,
              clients (
                name
              ),
              professionals (
                name
              ),
              services (
                name,
                price
              )
            `)
            .eq('salon_id', filters.salonId)
            .gte('start_time', `${filters.startDate}T00:00:00`)
            .lte('start_time', `${filters.endDate}T23:59:59`)
            .order('start_time', { ascending: true });

          if (appointmentsError) throw appointmentsError;
          
          reportData = (appointments || []).map(appointment => ({
            'Data': new Date(appointment.start_time).toLocaleDateString('pt-BR'),
            'Horário': new Date(appointment.start_time).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            'Cliente': appointment.clients?.name || '-',
            'Profissional': appointment.professionals?.name || '-',
            'Serviço': appointment.services?.name || '-',
            'Valor': new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(appointment.services?.price || 0),
            'Status': appointment.status === 'confirmed' ? 'Confirmado' :
                     appointment.status === 'completed' ? 'Concluído' :
                     appointment.status === 'cancelled' ? 'Cancelado' :
                     appointment.status === 'no-show' ? 'Não Compareceu' : 
                     'Pendente'
          }));
          break;
        }

        case 'clients': {
          const { data: clients, error: clientsError } = await supabase
            .from('clients')
            .select(`
              id,
              name,
              email,
              phone,
              created_at,
              appointments (
                id,
                status
              )
            `)
            .eq('salon_id', filters.salonId)
            .gte('created_at', `${filters.startDate}T00:00:00`)
            .lte('created_at', `${filters.endDate}T23:59:59`);

          if (clientsError) throw clientsError;

          reportData = (clients || []).map(client => ({
            'Nome': client.name,
            'Email': client.email || '-',
            'Telefone': client.phone || '-',
            'Data de Cadastro': new Date(client.created_at).toLocaleDateString('pt-BR'),
            'Agendamentos Totais': client.appointments?.length || 0,
            'Agendamentos Concluídos': client.appointments?.filter(apt => apt.status === 'completed').length || 0,
            'Agendamentos Cancelados': client.appointments?.filter(apt => apt.status === 'cancelled').length || 0
          }));
          break;
        }

        case 'revenue': {
          const { data: appointments, error: revenueError } = await supabase
            .from('appointments')
            .select(`
              start_time,
              status,
              services (
                name,
                price
              )
            `)
            .eq('salon_id', filters.salonId)
            .in('status', ['completed', 'confirmed'])
            .gte('start_time', `${filters.startDate}T00:00:00`)
            .lte('start_time', `${filters.endDate}T23:59:59`);

          if (revenueError) throw revenueError;

          const dailyRevenue = (appointments || []).reduce((acc: any, curr) => {
            const date = new Date(curr.start_time).toLocaleDateString('pt-BR');
            if (!acc[date]) {
              acc[date] = { 
                completed: 0, 
                confirmed: 0,
                completedRevenue: 0,
                confirmedRevenue: 0 
              };
            }

            if (curr.status === 'completed') {
              acc[date].completed++;
              acc[date].completedRevenue += curr.services?.price || 0;
            } else if (curr.status === 'confirmed') {
              acc[date].confirmed++;
              acc[date].confirmedRevenue += curr.services?.price || 0;
            }

            return acc;
          }, {});

          reportData = Object.entries(dailyRevenue).map(([date, values]: [string, any]) => ({
            'Data': date,
            'Serviços Concluídos': values.completed,
            'Receita Realizada': new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(values.completedRevenue),
            'Serviços Agendados': values.confirmed,
            'Receita Prevista': new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(values.confirmedRevenue),
            'Total de Serviços': values.completed + values.confirmed,
            'Receita Total': new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(values.completedRevenue + values.confirmedRevenue)
          }));
          break;
        }

        case 'services': {
          const { data: services, error: servicesError } = await supabase
            .from('services')
            .select(`
              id,
              name,
              duration,
              price,
              appointments (
                id,
                status,
                start_time
              )
            `)
            .eq('salon_id', filters.salonId)
            .eq('active', true);

          if (servicesError) throw servicesError;

          reportData = (services || []).map(service => {
            const appointments = service.appointments || [];
            const filteredAppointments = appointments.filter(apt => {
              const aptDate = new Date(apt.start_time);
              const startDate = new Date(`${filters.startDate}T00:00:00`);
              const endDate = new Date(`${filters.endDate}T23:59:59`);
              return aptDate >= startDate && aptDate <= endDate;
            });

            const completedAppointments = filteredAppointments.filter(
              apt => apt.status === 'completed'
            ).length;

            const confirmedAppointments = filteredAppointments.filter(
              apt => apt.status === 'confirmed'
            ).length;

            return {
              'Serviço': service.name,
              'Duração (min)': service.duration,
              'Preço': new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(service.price),
              'Agendamentos Concluídos': completedAppointments,
              'Agendamentos Confirmados': confirmedAppointments,
              'Total de Agendamentos': completedAppointments + confirmedAppointments,
              'Receita Realizada': new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(service.price * completedAppointments),
              'Receita Prevista': new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(service.price * confirmedAppointments),
              'Receita Total': new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(service.price * (completedAppointments + confirmedAppointments))
            };
          });
          break;
        }
      }

      setData(reportData);
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      setError(error.message || 'Erro ao gerar relatório. Por favor, tente novamente.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data.length) return;

    try {
      const headers = Object.keys(data[0]);
      const rows = data.map(item => 
        headers.map(header => {
          const value = item[header];
          // Handle values that contain commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );
      
      const csvContent = [
        headers.join(','),
        ...rows
      ].join('\n');
      
      // Add BOM for proper UTF-8 encoding in Excel
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-${filters.type}-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      setError('Erro ao exportar relatório. Por favor, tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Estabelecimento */}
          <div>
            <label htmlFor="salonId" className="block text-sm font-medium text-gray-700">
              Estabelecimento
            </label>
            <div className="mt-1 relative">
              <select
                id="salonId"
                value={filters.salonId || ''}
                onChange={e => setFilters({ ...filters, salonId: e.target.value || null })}
                disabled={loadingSalons || filters.type === 'subscriptions'}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
              >
                <option value="">Selecione um estabelecimento</option>
                {salons.map(salon => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data Inicial */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Data Inicial
            </label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={e => setFilters({ ...filters, startDate: e.target.value })}
              max={filters.endDate}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* Data Final */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Data Final
            </label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={e => setFilters({ ...filters, endDate: e.target.value })}
              min={filters.startDate}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* Tipo de Relatório */}
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">
              Tipo de Relatório
            </label>
            <div className="mt-1 relative">
              <select
                id="reportType"
                value={filters.type}
                onChange={e => {
                  const newType = e.target.value as ReportType;
                  setFilters({ 
                    ...filters, 
                    type: newType,
                    salonId: newType === 'subscriptions' ? null : filters.salonId 
                  });
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 appearance-none pr-10"
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={exportCSV}
            disabled={loading || !data.length}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            Exportar CSV
          </button>
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(data[0]).map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value: any, i) => (
                      <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 text-center text-gray-500 rounded-lg shadow-md">
          {error ? 'Erro ao carregar dados' : 'Nenhum dado encontrado para os filtros selecionados'}
        </div>
      )}
    </div>
  );
}