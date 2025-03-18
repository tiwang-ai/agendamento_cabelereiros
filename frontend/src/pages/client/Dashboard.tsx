import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  todayAppointments: number;
  activeClients: number;
  todayRevenue: number;
}

interface Appointment {
  id: string;
  start_time: string;
  client: { name: string };
  professional: { name: string };
  service: { name: string; price: number };
  status: string;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activeClients: 0,
    todayRevenue: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        const { data: salonData } = await supabase
          .from('salons')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (salonData) {
          // Get today's date range
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // Get current time and 3 hours ahead
          const now = new Date();
          const threeHoursAhead = new Date(now.getTime() + 3 * 60 * 60 * 1000);

          // Fetch all today's appointments
          const { data: todayAppointments } = await supabase
            .from('appointments')
            .select(`
              *,
              client:clients(name),
              professional:professionals(name),
              service:services(name, price)
            `)
            .eq('salon_id', salonData.id)
            .gte('start_time', today.toISOString())
            .lt('start_time', tomorrow.toISOString());

          // Fetch active clients count
          const { count: activeClients } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('salon_id', salonData.id);

          // Fetch upcoming appointments
          const { data: upcoming } = await supabase
            .from('appointments')
            .select(`
              *,
              client:clients(name),
              professional:professionals(name),
              service:services(name, price)
            `)
            .eq('salon_id', salonData.id)
            .eq('status', 'confirmed')
            .gte('start_time', now.toISOString())
            .lt('start_time', threeHoursAhead.toISOString())
            .order('start_time');

          // Calculate today's revenue
          const todayRevenue = (todayAppointments || [])
            .filter(apt => apt.status === 'completed')
            .reduce((total, apt) => total + (apt.service.price || 0), 0);

          setStats({
            todayAppointments: todayAppointments?.length || 0,
            activeClients: activeClients || 0,
            todayRevenue,
          });

          setUpcomingAppointments(upcoming || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [user]);

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