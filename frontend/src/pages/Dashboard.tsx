import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/lib/database.types';

type DashboardStats = {
  todayAppointments: number;
  activeClients: number;
  todayRevenue: number;
};

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  client: { name: string };
  professional: { name: string };
  service: { name: string; price: number };
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    activeClients: 0,
    todayRevenue: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDailyList, setShowDailyList] = useState(false);

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
        const { data: allTodayAppointments } = await supabase
          .from('appointments')
          .select(`
            *,
            client:clients(name),
            professional:professionals(name),
            service:services(name, price)
          `)
          .eq('salon_id', salonData.id)
          .eq('status', 'confirmed')
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString())
          .order('start_time', { ascending: true });

        // Fetch active clients count
        const { count: activeClients } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('salon_id', salonData.id);

        // Fetch upcoming appointments (next 3 hours)
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
          .order('start_time', { ascending: true });

        // Calculate today's revenue from completed appointments
        const todayRevenue = (allTodayAppointments || [])
          .filter(apt => apt.status === 'completed')
          .reduce((total, apt) => total + (apt.service.price || 0), 0);

        setStats({
          todayAppointments: allTodayAppointments?.length || 0,
          activeClients: activeClients || 0,
          todayRevenue,
        });

        setUpcomingAppointments(upcoming || []);
        setTodayAppointments(allTodayAppointments || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handlePaymentConfirmation = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Error confirming payment. Please try again.');
    }
  };

  const handleNoShow = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'no-show' })
        .eq('id', appointmentId);

      if (error) throw error;
      fetchDashboardData();
    } catch (error) {
      console.error('Error marking as no-show:', error);
      alert('Error marking as no-show. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setShowDailyList(!showDailyList)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          {showDailyList ? 'Hide' : 'View'} Today's Appointments
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats cards remain the same */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Appointments Today</h2>
          <p className="text-3xl font-bold text-primary-600">{stats.todayAppointments}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Active Clients</h2>
          <p className="text-3xl font-bold text-primary-600">{stats.activeClients}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Revenue Today</h2>
          <p className="text-3xl font-bold text-primary-600">
            R$ {stats.todayRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Today's Full Appointment List */}
      {showDailyList && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            All Appointments Today
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayAppointments.map((appointment) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R$ {appointment.service.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'no-show'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {appointment.status === 'confirmed' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePaymentConfirmation(appointment.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Confirm Payment
                          </button>
                          <button
                            onClick={() => handleNoShow(appointment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            No Show
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upcoming Appointments section remains the same */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Upcoming Appointments (Next 3 Hours)
        </h2>
        <div className="overflow-x-auto">
          {upcomingAppointments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professional
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
              No upcoming appointments in the next 3 hours
            </p>
          )}
        </div>
      </div>
    </div>
  );
}