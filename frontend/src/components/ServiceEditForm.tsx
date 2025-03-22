import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

/**
 * Interface que define a estrutura de um serviço
 */
interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  salon_id: string;
  active: boolean;
  created_at: string;
}

/**
 * Props do componente ServiceEditForm
 */
interface ServiceEditFormProps {
  service: Service;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Componente para edição de serviços existentes
 */
export default function ServiceEditForm({ service, onClose, onSuccess }: ServiceEditFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
    }
  });

  /**
   * Processa o envio do formulário de edição
   */
  const onSubmit = async (data: { name: string; description: string; duration: number; price: number }) => {
    setSubmitting(true);
    
    try {
      // Simulando um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Aqui seria feita a integração com a API real
      console.log('Atualizando serviço:', { id: service.id, ...data });
      
      // Simulando uma resposta bem-sucedida
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      alert('Erro ao atualizar serviço. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome do Serviço
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
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          Duração (minutos)
        </label>
        <input
          type="number"
          id="duration"
          min="1"
          {...register('duration', {
            required: 'Duração é obrigatória',
            min: { value: 1, message: 'Duração deve ser de pelo menos 1 minuto' }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.duration && (
          <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Preço (R$)
        </label>
        <input
          type="number"
          id="price"
          step="0.01"
          min="0"
          {...register('price', {
            required: 'Preço é obrigatório',
            min: { value: 0, message: 'Preço deve ser pelo menos 0' }
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
          disabled={submitting}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Atualizando...
            </span>
          ) : 'Atualizar Serviço'}
        </button>
      </div>
    </form>
  );
}