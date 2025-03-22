/**
 * Dashboard principal do dono de salão
 * 
 * Este componente exibe as informações principais do salão para o proprietário, 
 * incluindo estatísticas e próximos agendamentos.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Appointment } from '@/types/appointment';

/**
 * Estatísticas exibidas no dashboard
 */
interface DashboardStats {
  todayAppointments: number;
  activeClients: number;
  todayRevenue: number;
}

/**
 * Dados mockados para simular a resposta da API
 */
const MOCK_DATA = {
  salonData: { id: 'salon-123' },
  todayAppointments: [
    {
      id: 'apt-1',
      start_time: new Date(new Date().setHours(10, 0, 0)).toISOString(),
      status: 'confirmed',
      client: { name: 'Maria Silva' },
      professional: { name: 'João Cabeleireiro' },
      service: { name: 'Corte Feminino', price: 80 }
    },
    {
      id: 'apt-2',
      start_time: new Date(new Date().setHours(14, 30, 0)).toISOString(),
      status: 'completed',
      client: { name: 'Ana Souza' },
      professional: { name: 'Carlos Barbeiro' },
      service: { name: 'Coloração', price: 150 }
    },
    {
      id: 'apt-3',
      start_time: new Date(new Date().setHours(16, 0, 0)).toISOString(),
      status: 'confirmed',
      client: { name: 'Juliana Costa' },
      professional: { name: 'Mariana Esteticista' },
      service: { name: 'Manicure', price: 60 }
    }
  ],
  activeClients: 48,
  upcomingAppointments: [
    {
      id: 'apt-4',
      start_time: new Date(new Date().setHours(new Date().getHours() + 1, 0, 0)).toISOString(),
      status: 'confirmed',
      client: { name: 'Carla Mendes' },
      professional: { name: 'João Cabeleireiro' },
      service: { name: 'Escova', price: 70 }
    }
  ]
};

/**
 * Componente Dashboard do Salão
 */
export default function ClientDashboard() {
  const { user } = useAuth();
  // Inicializa estados com valores padrão
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activeClients: 0,
    todayRevenue: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Simula a busca de dados do dashboard na API
     */
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Simulando delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Usando dados mockados em vez de Supabase
        const salonData = MOCK_DATA.salonData;
        const todayAppointments = MOCK_DATA.todayAppointments;
        const activeClients = MOCK_DATA.activeClients;
        const upcoming = MOCK_DATA.upcomingAppointments;

        // Calcula receita de hoje com base nos agendamentos completados
        const todayRevenue = todayAppointments
          .filter(apt => apt.status === 'completed')
          .reduce((total, apt) => total + (apt.service.price || 0), 0);

        // Atualiza os estados
        setStats({
          todayAppointments: todayAppointments.length,
          activeClients: activeClients,
          todayRevenue,
        });

        setUpcomingAppointments(upcoming);
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Atualiza os dados a cada minuto
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Exibe loading enquanto os dados estão sendo carregados
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Agendamentos Hoje</h2>
          <p className="text-3xl font-bold text-primary-600">{stats.todayAppointments}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Clientes Ativos</h2>
          <p className="text-3xl font-bold text-primary-600">{stats.activeClients}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Receita Hoje</h2>
          <p className="text-3xl font-bold text-primary-600">
            R$ {stats.todayRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabela de próximos agendamentos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Próximos Agendamentos (3 horas)
        </h2>
        <div className="overflow-x-auto">
          {upcomingAppointments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(appointment.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.service.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.professional.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 py-4">
              Nenhum agendamento nas próximas 3 horas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}