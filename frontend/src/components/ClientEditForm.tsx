import React from 'react';
import { useForm } from 'react-hook-form';
import { mockApi } from '@/lib/mockApi';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
}

interface ClientEditFormProps {
  client: Client;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClientEditForm({ client, onClose, onSuccess }: ClientEditFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    defaultValues: {
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await mockApi.updateClient(client.id, {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Erro ao atualizar cliente. Por favor, tente novamente.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
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
          Update Client
        </button>
      </div>
    </form>
  );
}