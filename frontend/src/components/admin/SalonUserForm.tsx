/**
 * Formulário de Usuário do Salão
 * 
 * Este componente permite criar e editar usuários vinculados a um salão específico.
 * Suporta diferentes níveis de acesso (admin, owner, professional, receptionist).
 * 
 * @component
 * @example
 * ```tsx
 * <SalonUserForm 
 *   salonId="123"
 *   user={existingUser}
 *   onClose={() => setShowForm(false)}
 *   onSuccess={() => handleSuccess()}
 * />
 * ```
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { salonService } from '@/services/salon';
import { SalonUser, SalonUserFormProps, SalonUserFormData, UserRole } from '@/types/salon';

/**
 * Opções de permissões de acesso disponíveis
 */
const roleOptions = [
  { value: UserRole.ADMIN, label: 'Administrador' },
  { value: UserRole.OWNER, label: 'Proprietário' },
  { value: UserRole.PROFESSIONAL, label: 'Profissional' },
  { value: UserRole.RECEPTIONIST, label: 'Recepcionista' },
];

/**
 * Componente de formulário para criar e editar usuários do salão
 * 
 * @param {SalonUserFormProps} props - Propriedades do componente
 * @param {SalonUser | null} props.user - Usuário existente para edição (opcional)
 * @param {string} props.salonId - ID do salão ao qual o usuário será vinculado
 * @param {() => void} props.onClose - Callback chamado ao fechar o formulário
 * @param {() => void} props.onSuccess - Callback chamado após salvar com sucesso
 */
export default function SalonUserForm({ user, salonId, onClose, onSuccess }: SalonUserFormProps) {
  // Configuração do formulário com react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm<SalonUserFormData>({
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    } : undefined
  });

  // Estado local para loading e erros
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Processa o envio do formulário
   * @param {SalonUserFormData} data - Dados do formulário
   */
  const onSubmit = async (data: SalonUserFormData) => {
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
      {/* Cabeçalho do formulário */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-medium text-gray-900">
          {user ? 'Editar' : 'Novo'} Usuário
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Fechar formulário"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Campo: Nome do Usuário */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Nome é obrigatório' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.name.message}</p>
        )}
      </div>

      {/* Campo: Email do Usuário */}
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
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.email.message}</p>
        )}
      </div>

      {/* Campo: Telefone do Usuário */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Telefone
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="(00) 00000-0000"
        />
      </div>

      {/* Campo: Permissão de Acesso */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Permissão de Acesso
        </label>
        <select
          id="role"
          {...register('role', { required: 'Permissão é obrigatória' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          aria-invalid={errors.role ? 'true' : 'false'}
        >
          {roleOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600" role="alert">{errors.role.message}</p>
        )}
      </div>

      {/* Botões de ação */}
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