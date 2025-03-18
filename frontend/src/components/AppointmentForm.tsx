import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/lib/database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type Professional = Database['public']['Tables']['professionals']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  client: { name: string };
  professional: { name: string };
  service: { name: string };
};

interface AppointmentFormData {
  clientId: string;
  professionalId: string;
  serviceId: string;
  date: string;
  time: string;
}

interface AppointmentFormProps {
  appointment?: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

interface WarningModalProps {
  onClose: () => void;
  professional: Professional | undefined;
  date: string;
  time: string;
}

function WarningModal({ onClose, professional, date, time }: WarningModalProps) {
  const formattedDate = new Date(`${date}T${time}`).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = new Date(`${date}T${time}`).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">
            Time Slot Not Available
          </h3>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            The selected time slot is not available for{' '}
            <span className="font-medium text-gray-900">{professional?.name}</span> on:
          </p>
          
          <div className="mt-2 bg-gray-50 p-4 rounded-lg">
            <div className="font-medium text-gray-900">{formattedDate}</div>
            <div className="text-gray-500">{formattedTime}</div>
          </div>
          
          <p className="mt-4 text-sm text-gray-500">
            Please select a different time slot or professional.
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
          >
            Choose Another Time
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentForm({ appointment, onClose, onSuccess }: AppointmentFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AppointmentFormData>({
    defaultValues: appointment ? {
      clientId: appointment.client_id,
      professionalId: appointment.professional_id,
      serviceId: appointment.service_id,
      date: new Date(appointment.start_time).toISOString().split('T')[0],
      time: new Date(appointment.start_time).toTimeString().slice(0, 5),
    } : undefined
  });
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const serviceId = watch('serviceId');
  const professionalId = watch('professionalId');
  const date = watch('date');
  const time = watch('time');

  const selectedProfessional = professionals.find(p => p.id === professionalId);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: salonData } = await supabase
          .from('salons')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (salonData) {
          const [clientsResponse, professionalsResponse, servicesResponse] = await Promise.all([
            supabase.from('clients').select('*').eq('salon_id', salonData.id),
            supabase.from('professionals').select('*').eq('salon_id', salonData.id),
            supabase.from('services').select('*').eq('salon_id', salonData.id).eq('active', true)
          ]);

          setClients(clientsResponse.data || []);
          setProfessionals(professionalsResponse.data || []);
          setServices(servicesResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (serviceId) {
      const service = services.find(s => s.id === serviceId);
      setSelectedService(service || null);
    }
  }, [serviceId, services]);

  const checkAvailability = async (startTime: Date, endTime: Date, professionalId: string) => {
    const query = supabase
      .from('appointments')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('status', 'confirmed')
      .or(`start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()}`);

    // If editing an existing appointment, exclude it from the check
    if (appointment) {
      query.neq('id', appointment.id);
    }

    const { data: existingAppointments } = await query;
    return !existingAppointments || existingAppointments.length === 0;
  };

  const onSubmit = async (data: AppointmentFormData) => {
    if (!user || !selectedService) return;

    try {
      const { data: salonData } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!salonData) throw new Error('Salon not found');

      const startTime = new Date(`${data.date}T${data.time}`);
      const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);

      // Check if the time slot is available
      const isAvailable = await checkAvailability(startTime, endTime, data.professionalId);

      if (!isAvailable) {
        setShowWarning(true);
        return;
      }

      const appointmentData = {
        salon_id: salonData.id,
        client_id: data.clientId,
        professional_id: data.professionalId,
        service_id: data.serviceId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'confirmed'
      };

      if (appointment) {
        // Update existing appointment
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', appointment.id);

        if (error) throw error;
      } else {
        // Create new appointment
        const { error } = await supabase
          .from('appointments')
          .insert([appointmentData]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Error saving appointment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
            Client
          </label>
          <select
            id="clientId"
            {...register('clientId', { required: 'Client is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Select a client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="professionalId" className="block text-sm font-medium text-gray-700">
            Professional
          </label>
          <select
            id="professionalId"
            {...register('professionalId', { required: 'Professional is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Select a professional</option>
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>
          {errors.professionalId && (
            <p className="mt-1 text-sm text-red-600">{errors.professionalId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">
            Service
          </label>
          <select
            id="serviceId"
            {...register('serviceId', { required: 'Service is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">Select a service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} ({service.duration} min - R$ {service.price})
              </option>
            ))}
          </select>
          {errors.serviceId && (
            <p className="mt-1 text-sm text-red-600">{errors.serviceId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            {...register('date', { required: 'Date is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700">
            Time
          </label>
          <input
            type="time"
            id="time"
            {...register('time', { required: 'Time is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {appointment ? 'Update' : 'Create'} Appointment
          </button>
        </div>
      </form>

      {showWarning && (
        <WarningModal
          onClose={() => setShowWarning(false)}
          professional={selectedProfessional}
          date={date}
          time={time}
        />
      )}
    </>
  );
}