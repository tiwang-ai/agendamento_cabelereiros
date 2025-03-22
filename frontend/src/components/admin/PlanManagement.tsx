/**
 * Gerenciamento de Planos de Assinatura
 * 
 * Este componente fornece uma interface para gerenciar planos de assinatura do sistema,
 * permitindo criar, editar e excluir planos. Cada plano possui recursos e limites
 * específicos que podem ser configurados.
 * 
 * @component
 * @example
 * ```tsx
 * <PlanManagement />
 * ```
 */
import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import SubscriptionPlanForm from './SubscriptionPlanForm';
import { mockApi } from '@/mocks/data';
import { SubscriptionPlan } from '@/types/subscription';

/**
 * Componente principal de gerenciamento de planos
 */
export default function PlanManagement() {
  // Estado local
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  /**
   * Busca a lista de planos disponíveis
   * @todo Substituir por chamada real à API
   */
  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Simulando delay de rede
      await mockApi.delay(500);
      
      // Usando dados mockados
      const data = await mockApi.getSubscriptionPlans();
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega os planos ao montar o componente
  useEffect(() => {
    fetchPlans();
  }, []);

  /**
   * Abre o formulário de edição de plano
   * @param {SubscriptionPlan} plan - Plano a ser editado
   */
  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowForm(true);
  };

  /**
   * Exclui um plano de assinatura
   * @param {string} id - ID do plano a ser excluído
   */
  const handleDelete = async (id: string) => {
    try {
      // Simulando delay de rede
      await mockApi.delay(500);
      
      // Verificar assinaturas ativas
      const activeSubscriptions = await mockApi.getActiveSubscriptions(id);

      if (activeSubscriptions && activeSubscriptions.length > 0) {
        alert('Não é possível excluir um plano que possui assinaturas ativas.');
        return;
      }

      // Deletar plano
      await mockApi.deleteSubscriptionPlan(id);

      // Atualizar lista
      fetchPlans();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Erro ao excluir plano. Por favor, tente novamente.');
    }
  };

  // Renderiza o loader enquanto carrega os dados
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" aria-label="Carregando..."></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botão de novo plano */}
      <div className="flex justify-between items-center">
        <div className="space-x-4">
          <button
            onClick={() => {
              setSelectedPlan(null);
              setShowForm(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Novo Plano
          </button>
        </div>
      </div>

      {/* Grid de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white p-6 rounded-lg shadow-md">
            {/* Cabeçalho do card */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-2xl font-bold text-primary-600 mt-2">
                  R$ {plan.price.toFixed(2)}/mês
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="text-primary-600 hover:text-primary-900"
                  aria-label={`Editar plano ${plan.name}`}
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(plan.id)}
                  className="text-red-600 hover:text-red-900"
                  aria-label={`Excluir plano ${plan.name}`}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Descrição do plano */}
            {plan.description && (
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
            )}

            {/* Lista de recursos */}
            <div className="mt-4">
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
        ))}
      </div>

      {/* Modal de formulário */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <SubscriptionPlanForm
              plan={selectedPlan}
              onClose={() => {
                setShowForm(false);
                setSelectedPlan(null);
              }}
              onSuccess={() => {
                fetchPlans();
                setShowForm(false);
                setSelectedPlan(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 id="delete-modal-title" className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}