import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Professional = Database['public']['Tables']['professionals']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

interface ProfessionalEditFormProps {
  professional: Professional;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#2563EB', // Blue
  '#0891B2', // Cyan
  '#059669', // Emerald
  '#16A34A', // Green
  '#CA8A04', // Yellow
  '#DC2626', // Red
  '#9333EA', // Purple
  '#DB2777', // Pink
  '#475569', // Slate
];

export default function ProfessionalEditForm({ professional, onClose, onSuccess }: ProfessionalEditFormProps) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      name: professional.name,
      email: professional.email || '',
      specialties: professional.specialties || [],
      color: professional.color || '#4F46E5'
    }
  });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const selectedColor = watch('color');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('salon_id', professional.salon_id)
          .eq('active', true)
          .order('name');

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Error loading services. Some features may be limited.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [professional.salon_id]);

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          name: data.name,
          email: data.email || null,
          specialties: data.specialties,
          color: data.color
        })
        .eq('id', professional.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating professional:', error);
      setError('Error updating professional. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calendar Color
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <div
              className="w-6 h-6 rounded-full mr-2"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-gray-900">{selectedColor}</span>
          </button>

          {showColorPicker && (
            <div className="absolute z-10 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="grid grid-cols-5 gap-2 mb-4">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      setValue('color', color);
                      setShowColorPicker(false);
                    }}
                    className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-primary-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Color
                </label>
                <input
                  type="color"
                  {...register('color')}
                  className="block w-full h-10 rounded-md"
                  onChange={(e) => {
                    setValue('color', e.target.value);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialties
        </label>
        <div className="space-y-2">
          {loading ? (
            <div className="animate-pulse h-10 bg-gray-100 rounded"></div>
          ) : (
            services.map((service) => (
              <label key={service.id} className="flex items-center">
                <input
                  type="checkbox"
                  value={service.name}
                  {...register('specialties')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-700">{service.name}</span>
              </label>
            ))
          )}
        </div>
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
          Update Professional
        </button>
      </div>
    </form>
  );
}