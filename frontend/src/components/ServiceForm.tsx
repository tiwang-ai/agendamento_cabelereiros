import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceFormData {
  name: string;
  duration: number;
  price: number;
}

interface ServiceFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ServiceForm({ onClose, onSuccess }: ServiceFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormData>();
  const { user } = useAuth();

  const onSubmit = async (data: ServiceFormData) => {
    if (!user) return;

    try {
      const { data: salonData } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (!salonData) throw new Error('Salon not found');

      const { error } = await supabase
        .from('services')
        .insert([
          {
            salon_id: salonData.id,
            name: data.name,
            duration: data.duration,
            price: data.price,
          }
        ]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Error creating service. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Service Name
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
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          Duration (minutes)
        </label>
        <input
          type="number"
          id="duration"
          min="1"
          {...register('duration', {
            required: 'Duration is required',
            min: { value: 1, message: 'Duration must be at least 1 minute' }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.duration && (
          <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price (R$)
        </label>
        <input
          type="number"
          id="price"
          step="0.01"
          min="0"
          {...register('price', {
            required: 'Price is required',
            min: { value: 0, message: 'Price must be at least 0' }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
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
          Create Service
        </button>
      </div>
    </form>
  );
}