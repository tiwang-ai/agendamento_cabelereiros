import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import AppointmentForm from '@/components/AppointmentForm';

type Professional = Database['public']['Tables']['professionals']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  client: { name: string };
  service: { name: string };
  professional: { name: string };
};

interface ProfessionalScheduleProps {
  professional: Professional;
  onClose: () => void;
}

interface AppointmentDetailsModalProps {
  event: any;
  onClose: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

function AppointmentDetailsModal({ event, onClose, onEdit, onCancel }: AppointmentDetailsModalProps) {
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
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cancel Appointment
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Edit Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfessionalSchedule({ professional, onClose }: ProfessionalScheduleProps) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchAppointmentDetails = async (appointmentId: string) => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients(*),
          professional:professionals(*),
          service:services(*)
        `)
        .eq('id', appointmentId)
        .single();

      return data;
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await supabase
          .from('appointments')
          .select(`
            *,
            client:clients(name),
            service:services(name)
          `)
          .eq('professional_id', professional.id)
          .eq('status', 'confirmed');

        if (data) {
          const formattedAppointments = data.map((apt: Appointment) => ({
            id: apt.id,
            title: `${apt.client.name} - ${apt.service.name}`,
            start: apt.start_time,
            end: apt.end_time,
            backgroundColor: '#4F46E5',
            borderColor: '#4338CA',
            textColor: '#ffffff',
            extendedProps: {
              client: apt.client.name,
              service: apt.service.name,
              appointmentId: apt.id
            }
          }));
          setAppointments(formattedAppointments);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [professional.id]);

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
  };

  const handleEditAppointment = async () => {
    if (!selectedEvent) return;

    const appointmentDetails = await fetchAppointmentDetails(selectedEvent.extendedProps.appointmentId);
    if (appointmentDetails) {
      setSelectedAppointment(appointmentDetails);
      setShowEditForm(true);
      setSelectedEvent(null);
    }
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          Schedule for {professional.name}
        </h2>
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

      <div className="bg-white p-4 rounded-lg">
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
            </div>
          )}
        />
      </div>

      {selectedEvent && (
        <AppointmentDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditAppointment}
          onCancel={handleCancelAppointment}
        />
      )}

      {showEditForm && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Appointment</h2>
            <AppointmentForm
              appointment={selectedAppointment}
              onClose={() => {
                setShowEditForm(false);
                setSelectedAppointment(null);
              }}
              onSuccess={() => {
                setShowEditForm(false);
                setSelectedAppointment(null);
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}