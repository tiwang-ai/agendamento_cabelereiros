import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Database } from '@/lib/database.types';

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  client: { name: string };
  professional: { name: string; color: string };
  service: { name: string };
};

interface EventModalProps {
  event: any;
  onClose: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
}

function EventModal({ event, onClose, onEdit, onCancel }: EventModalProps) {
  const props = event.extendedProps;
  const startTime = event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = event.start.toLocaleDateString([], { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Appointment Details
          </h3>
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

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Date</div>
            <div className="font-medium text-gray-900">{date}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Start Time</div>
              <div className="font-medium text-gray-900">{startTime}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">End Time</div>
              <div className="font-medium text-gray-900">{endTime}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Client</div>
            <div className="font-medium text-gray-900">{props.client}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Service</div>
            <div className="font-medium text-gray-900">{props.service}</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Professional</div>
            <div className="font-medium text-gray-900">{props.professional}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel Appointment
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Edit Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      try {
        const { data: salonData } = await supabase
          .from('salons')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (salonData) {
          const { data } = await supabase
            .from('appointments')
            .select(`
              *,
              client:clients(name),
              professional:professionals(name, color),
              service:services(name)
            `)
            .eq('salon_id', salonData.id)
            .eq('status', 'confirmed');

          if (data) {
            const formattedAppointments = data.map((apt: Appointment) => ({
              id: apt.id,
              title: `${apt.client.name} - ${apt.service.name}`,
              start: apt.start_time,
              end: apt.end_time,
              backgroundColor: apt.professional.color,
              borderColor: apt.professional.color,
              textColor: '#ffffff',
              extendedProps: {
                client: apt.client.name,
                professional: apt.professional.name,
                service: apt.service.name,
                appointmentId: apt.id
              }
            }));
            setAppointments(formattedAppointments);
          }
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
  };

  const handleEditAppointment = () => {
    // Implement edit functionality
    setSelectedEvent(null);
  };

  const handleCancelAppointment = async () => {
    if (!selectedEvent || !confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', selectedEvent.extendedProps.appointmentId);

      if (error) throw error;

      // Refresh appointments
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Error cancelling appointment. Please try again.');
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
        <h1 className="text-2xl font-bold text-gray-900">Appointment Calendar</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale={ptBrLocale}
          events={appointments}
          eventClick={handleEventClick}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="auto"
          slotDuration="00:30:00"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5, 6],
            startTime: '08:00',
            endTime: '20:00',
          }}
          eventContent={(eventInfo) => (
            <div className="p-1 text-sm">
              <div className="font-semibold">{eventInfo.event.extendedProps.client}</div>
              <div className="text-xs">{eventInfo.event.extendedProps.service}</div>
              <div className="text-xs opacity-75">{eventInfo.event.extendedProps.professional}</div>
            </div>
          )}
        />
      </div>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditAppointment}
          onCancel={handleCancelAppointment}
        />
      )}
    </div>
  );
}