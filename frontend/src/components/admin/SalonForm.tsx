/**
 * Formulário de Salão
 * 
 * Este componente permite criar e editar salões no sistema.
 * Utiliza dados mockados para simulação enquanto não há backend.
 * 
 * @component
 * @example
 * ```tsx
 * <SalonForm 
 *   salon={existingSalon} 
 *   onClose={() => setShowForm(false)}
 *   onSuccess={() => handleSuccess()}
 * />
 * ```
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Salon, SalonFormProps, SalonFormData } from '@/types/salon';

/**
 * Componente de formulário para criar ou editar salões
 * 
 * @param {SalonFormProps} props - Propriedades do componente
 * @param {Salon | null} props.salon - Salão existente para edição (opcional)
 * @param {() => void} props.onClose - Callback chamado ao fechar o formulário
 * @param {() => void} props.onSuccess - Callback chamado após salvar com sucesso
 */
export default function SalonForm({ salon, onClose, onSuccess }: SalonFormProps) {
  // Configuração do formulário com react-hook-form
  const { register, handleSubmit, formState: { errors } } = useForm<SalonFormData>({
    defaultValues: salon ? {
      name: salon.name,
      address: salon.address || '',
    } : undefined
  });

  // Estado local para gerenciar telefones
  const [phones, setPhones] = useState<string[]>(salon?.phones || []);
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Adiciona um número de telefone à lista se ele for válido e não existir
   * @todo Adicionar validação de formato do telefone
   */
  const handleAddPhone = () => {
    if (newPhone && !phones.includes(newPhone)) {
      setPhones([...phones, newPhone]);
      setNewPhone('');
    }
  };

  /**
   * Remove um número de telefone específico da lista
   * @param {string} phone - Número de telefone a ser removido
   */
  const handleRemovePhone = (phone: string) => {
    setPhones(phones.filter(p => p !== phone));
  };

  /**
   * Processa o envio do formulário
   * @param {SalonFormData} data - Dados do formulário
   */
  const onSubmit = async (data: SalonFormData) => {
    setLoading(true);
    setError(null);

    try {
      // @todo Substituir por chamada real à API
      await new Promise(resolve => setTimeout(resolve, 800));

      if (salon) {
        // Atualização de salão existente
        console.log('Atualizando salão:', {
          id: salon.id,
          name: data.name,
          address: data.address || null,
          phones: phones.length > 0 ? phones : null
        });
      } else {
        // Criação de novo salão
        console.log('Criando novo salão:', {
          name: data.name,
          ownerEmail: data.ownerEmail,
          address: data.address || null,
          phones: phones.length > 0 ? phones : null,
          active: true
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar salão:', error);
      setError(error.message || 'Erro ao salvar salão. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Cabeçalho do formulário */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-medium text-gray-900">
          {salon ? 'Editar' : 'Novo'} Salão
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

      {/* Campo: Nome do Salão */}
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

      {/* Campo: Email do Proprietário (apenas na criação) */}
      {!salon && (
        <div>
          <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700">
            Email do Proprietário
          </label>
          <input
            type="email"
            id="ownerEmail"
            {...register('ownerEmail', {
              required: 'Email do proprietário é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Endereço de email inválido'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            aria-invalid={errors.ownerEmail ? 'true' : 'false'}
          />
          {errors.ownerEmail && (
            <p className="mt-1 text-sm text-red-600" role="alert">{errors.ownerEmail.message}</p>
          )}
        </div>
      )}

      {/* Campo: Endereço */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Endereço
        </label>
        <textarea
          id="address"
          {...register('address')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      {/* Seção: Telefones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Telefones
        </label>
        <div className="space-y-4">
          {/* Input para adicionar novo telefone */}
          <div className="flex gap-2">
            <input
              type="tel"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              placeholder="Adicionar número de telefone"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={handleAddPhone}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              aria-label="Adicionar telefone"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Lista de telefones */}
          <div className="space-y-2">
            {phones.map((phone, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md">{phone}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePhone(phone)}
                  className="text-red-600 hover:text-red-700"
                  aria-label={`Remover telefone ${phone}`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
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
          {loading ? 'Salvando...' : salon ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
}