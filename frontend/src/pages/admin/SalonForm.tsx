import React, { useState, useEffect } from 'react';
import { Salon, SalonStatus } from '../../types';
import { Button, Input, Select } from '../../components/ui';

/**
 * Propriedades do componente SalonForm
 */
interface SalonFormProps {
  salon?: Salon | null;
  onSave: (salon: Salon) => void;
  onCancel: () => void;
}

/**
 * Componente SalonForm
 * 
 * Formulário para adicionar ou editar um salão no sistema.
 * 
 * @component
 */
const SalonForm: React.FC<SalonFormProps> = ({ salon, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Salon>>({
    name: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    status: SalonStatus.PENDING,
    subscription_active: false,
    subscription_id: '',
    logo_url: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carrega os dados do salão quando estiver em modo de edição
  useEffect(() => {
    if (salon) {
      setFormData({
        id: salon.id,
        name: salon.name,
        owner_name: salon.owner_name,
        email: salon.email,
        phone: salon.phone,
        address: salon.address,
        status: salon.status,
        subscription_active: salon.subscription_active,
        subscription_id: salon.subscription_id,
        logo_url: salon.logo_url,
        created_at: salon.created_at
      });
    }
  }, [salon]);

  /**
   * Atualiza os dados do formulário quando um campo é alterado
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpa o erro quando o campo é editado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Atualiza o campo de status do salão
   */
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SalonStatus;
    setFormData(prev => ({
      ...prev,
      status: value
    }));
  };

  /**
   * Atualiza o campo de status da assinatura
   */
  const handleSubscriptionStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'true';
    setFormData(prev => ({
      ...prev,
      subscription_active: value
    }));
  };

  /**
   * Valida o formulário antes de enviar
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome do salão é obrigatório';
    }

    if (!formData.owner_name?.trim()) {
      newErrors.owner_name = 'Nome do proprietário é obrigatório';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Envia o formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Gera um ID se for um novo salão
      if (!formData.id) {
        formData.id = Date.now().toString();
        formData.created_at = new Date().toISOString();
      }

      // Envia os dados para o componente pai
      onSave(formData as Salon);
    } catch (error) {
      console.error('Erro ao salvar salão:', error);
      setErrors({
        submit: 'Ocorreu um erro ao salvar o salão. Por favor, tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Salão *
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          error={errors.name}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Proprietário *
        </label>
        <Input
          id="owner_name"
          name="owner_name"
          value={formData.owner_name || ''}
          onChange={handleChange}
          error={errors.owner_name}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          E-mail *
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          error={errors.email}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Telefone *
        </label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          error={errors.phone}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          Endereço *
        </label>
        <Input
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          error={errors.address}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
          URL do Logo
        </label>
        <Input
          id="logo_url"
          name="logo_url"
          value={formData.logo_url || ''}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <Select
          id="status"
          name="status"
          value={formData.status as string}
          onChange={handleStatusChange}
          className="w-full"
        >
          <option value={SalonStatus.ACTIVE}>Ativo</option>
          <option value={SalonStatus.INACTIVE}>Inativo</option>
          <option value={SalonStatus.PENDING}>Pendente</option>
        </Select>
      </div>

      <div>
        <label htmlFor="subscription_id" className="block text-sm font-medium text-gray-700 mb-1">
          ID da Assinatura
        </label>
        <Input
          id="subscription_id"
          name="subscription_id"
          value={formData.subscription_id || ''}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="subscription_active" className="block text-sm font-medium text-gray-700 mb-1">
          Status da Assinatura
        </label>
        <Select
          id="subscription_active"
          name="subscription_active"
          value={formData.subscription_active?.toString() || 'false'}
          onChange={handleSubscriptionStatusChange}
          className="w-full"
        >
          <option value="true">Ativa</option>
          <option value="false">Inativa</option>
        </Select>
      </div>

      {errors.submit && (
        <div className="text-red-500 text-sm mt-2">{errors.submit}</div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          color="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          color="primary"
          isLoading={isSubmitting}
        >
          {salon ? 'Atualizar' : 'Adicionar'} Salão
        </Button>
      </div>
    </form>
  );
};

export default SalonForm; 