import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { salonService } from '@/services/salon';
import { SalonUser } from '@/types/index';

interface SalonUserFormProps {
  user?: SalonUser | null;
  salonId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'owner' | 'professional' | 'receptionist';
}

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'owner', label: 'Proprietário' },
  { value: 'professional', label: 'Profissional' },
  { value: 'receptionist', label: 'Recepcionista' },
];

export default function SalonUserForm({ user, salonId, onClose, onSuccess }: SalonUserFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    } : undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      if (user) {
        // Atualizar usuário existente
        const updatedUser = await salonService.updateSalonUser(salonId, user.id, {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          role: data.role,
        });

        if (!updatedUser) throw new Error('Falha ao atualizar usuário');
      } else {
        // Criar novo usuário
        const newUser = await salonService.createSalonUser(salonId, {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          role: data.role,
          active: true
        });

        if (!newUser) throw new Error('Falha ao criar usuário');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      setError('Erro ao salvar usuário. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-medium text-gray-900">
          {user ? 'Editar' : 'Novo'} Usuário
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
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
          {...register('email', {
            required: 'Email é obrigatório',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Telefone
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Permissão de Acesso
        </label>
        <select
          id="role"
          {...register('role', { required: 'Permissão é obrigatória' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          {roleOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}