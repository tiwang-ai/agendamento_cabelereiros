/**
 * Formulário de Seleção de Plano de Assinatura
 * 
 * Este componente permite selecionar um plano de assinatura para um salão.
 * Exibe uma lista de planos disponíveis com seus recursos e limites,
 * permitindo criar uma nova assinatura ou atualizar uma existente.
 * 
 * @component
 * @example
 * ```tsx
 * <SubscriptionPlanForm 
 *   salonId="123"
 *   onClose={() => setShowForm(false)}
 *   onSuccess={() => handleSuccess()}
 * />
 * ```
 */
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { mockApi } from '@/mocks/data';
import { SubscriptionPlan } from '@/types/subscription';

/**
 * Props do componente de seleção de plano
 */
interface SubscriptionPlanSelectorProps {
  /** ID do salão que está selecionando o plano */
  salonId: string;
  
  /** Callback chamado ao fechar o formulário */
  onClose: () => void;
  
  /** Callback chamado após salvar com sucesso */
  onSuccess: () => void;
}

/**
 * Componente de formulário para seleção de plano de assinatura
 */
export default function SubscriptionPlanForm({ salonId, onClose, onSuccess }: SubscriptionPlanSelectorProps) {
  // Estado local
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega a lista de planos disponíveis
   * @todo Substituir por chamada real à API
   */
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        // Simulando delay de rede
        await mockApi.delay(500);
        
        // Usando dados mockados
        const data = await mockApi.getSubscriptionPlans();
        setPlans(data || []);
        if (data && data.length > 0) {
          setSelectedPlanId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        setError('Erro ao carregar planos. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  /**
   * Processa o envio do formulário
   * @param {React.FormEvent} e - Evento do formulário
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) {
      setError('Por favor, selecione um plano');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Simulando delay de rede
      await mockApi.delay(500);
      
      // Verificar assinatura existente
      const existingSubscription = await mockApi.getActiveSubscription(salonId);

      if (existingSubscription) {
        // Atualizar assinatura existente
        await mockApi.updateSubscription(existingSubscription.id, {
          plan_id: selectedPlanId,
          updated_at: new Date().toISOString()
        });
      } else {
        // Criar nova assinatura
        await mockApi.createSubscription({
          salon_id: salonId,
          plan_id: selectedPlanId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving subscription:', error);
      setError('Erro ao salvar assinatura. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Renderiza o loader enquanto carrega os dados
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48" role="status">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
          aria-label="Carregando planos..."
        ></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cabeçalho do formulário */}
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-medium text-gray-900">
          Selecionar Plano
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
        <div 
          role="alert" 
          className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative"
        >
          {error}
        </div>
      )}

      {/* Grid de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="radiogroup">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative border rounded-lg p-6 cursor-pointer ${
              selectedPlanId === plan.id
                ? 'border-primary-500 ring-2 ring-primary-500'
                : 'border-gray-200 hover:border-primary-300'
            }`}
            onClick={() => setSelectedPlanId(plan.id)}
            role="radio"
            aria-checked={selectedPlanId === plan.id}
          >
            <div className="flex flex-col h-full">
              {/* Cabeçalho do plano */}
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <p className="text-2xl font-bold text-primary-600 mt-2">
                R$ {plan.price.toFixed(2)}/mês
              </p>
              {plan.description && (
                <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
              )}

              {/* Lista de recursos */}
              <div className="mt-4 flex-grow">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Recursos</h4>
                <ul className="space-y-1" role="list">
                  {Object.entries(plan.features || {}).map(([feature, enabled]) => (
                    <li key={feature} className="flex items-center text-sm">
                      <span 
                        className={`mr-2 ${enabled ? 'text-green-500' : 'text-red-500'}`}
                        aria-hidden="true"
                      >
                        {enabled ? '✓' : '✗'}
                      </span>
                      <span className={enabled ? '' : 'line-through'}>
                        {feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lista de limites */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Limites</h4>
                <ul className="space-y-1" role="list">
                  {Object.entries(plan.limits || {}).map(([limit, value]) => (
                    <li key={limit} className="flex justify-between text-sm">
                      <span>{limit.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                      <span className="font-medium">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Input de seleção */}
            <div className="absolute top-4 right-4">
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selectedPlanId === plan.id}
                onChange={() => setSelectedPlanId(plan.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                aria-label={`Selecionar plano ${plan.name}`}
              />
            </div>
          </div>
        ))}
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
          disabled={submitting || !selectedPlanId}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          {submitting ? 'Salvando...' : 'Confirmar'}
        </button>
      </div>
    </form>
  );
}