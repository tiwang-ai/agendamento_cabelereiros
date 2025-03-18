import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  service: { name: string; price: number };
  professional: { name: string };
};

interface ClientHistoryProps {
  client: Client;
  onClose: () => void;
}

export default function ClientHistory({ client, onClose }: ClientHistoryProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalSpent: 0,
    lastVisit: null as string | null,
    completedAppointments: 0,
    canceledAppointments: 0,
    noShowAppointments: 0
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            service:services(name, price),
            professional:professionals(name)
          `)
          .eq('client_id', client.id)
          .order('start_time', { ascending: false });

        if (error) throw error;

        setAppointments(data || []);

        // Calculate statistics
        const completed = data?.filter(apt => apt.status === 'completed').length || 0;
        const canceled = data?.filter(apt => apt.status === 'cancelled').length || 0;
        const noShow = data?.filter(apt => apt.status === 'no-show').length || 0;
        const totalSpent = data
          ?.filter(apt => apt.status === 'completed')
          .reduce((sum, apt) => sum + (apt.service?.price || 0), 0) || 0;
        const lastVisit = data?.find(apt => apt.status === 'completed')?.start_time || null;

        setStats({
          totalAppointments: data?.length || 0,
          totalSpent,
          lastVisit,
          completedAppointments: completed,
          canceledAppointments: canceled,
          noShowAppointments: noShow
        });
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [client.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            History for {client.name}
          </h2>
          <p className="text-sm text-gray-500">
            Client since {new Date(client.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Appointments</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalAppointments}</div>
          <div className="mt-1 text-sm">
            <span className="text-green-600">{stats.completedAppointments} completed</span>
            {' • '}
            <span className="text-red-600">{stats.canceledAppointments} canceled</span>
            {' • '}
            <span className="text-yellow-600">{stats.noShowAppointments} no-show</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Spent</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            R$ {stats.totalSpent.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Last Visit</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {stats.lastVisit 
              ? new Date(stats.lastVisit).toLocaleDateString()
              : 'Never'
            }
          </div>
        </div>
      </div>

      {/* Appointments History */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(appointment.start_time).toLocaleDateString()}{' '}
                      {new Date(appointment.start_time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.service.name} with {appointment.professional.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      appointment.status === 'no-show' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      R$ {appointment.service.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {appointments.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
              No appointments found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}