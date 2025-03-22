/**
 * Detalhes da Assinatura
 * 
 * Este componente exibe os detalhes completos de uma assinatura de salão,
 * incluindo o plano atual, status, próxima cobrança, recursos incluídos,
 * limites e histórico de alterações.
 * 
 * @component
 * @example
 * ```tsx
 * <SubscriptionDetails 
 *   salonId="123"
 *   onClose={() => setShowDetails(false)}
 * />
 * ```
 */
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { mockApi } from '@/mocks/data';
import { 
  Subscription, 
  SubscriptionPlan, 
  SubscriptionHistory, 
  SubscriptionDetailsProps 
} from '@/types/subscription';

/**
 * Componente de detalhes da assinatura
 */
export default function SubscriptionDetails({ salonId, onClose }: SubscriptionDetailsProps) {
  // Estado local
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega os detalhes da assinatura, plano e histórico
   * @todo Substituir por chamada real à API
   */
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        setLoading(true);
        // Simulando delay de rede
        await mockApi.delay(500);
        
        // Buscar assinatura atual
        const currentSubscription = await mockApi.getActiveSubscription(salonId);
        setSubscription(currentSubscription);

        if (currentSubscription) {
          // Buscar detalhes do plano
          const planData = await mockApi.getSubscriptionPlan(currentSubscription.plan_id);
          setPlan(planData);

          // Buscar histórico de assinatura
          const historyData = await mockApi.getSubscriptionHistory(salonId);
          setHistory(historyData || []);
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
        setError('Erro ao carregar detalhes da assinatura');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [salonId]);

  // Renderiza o loader enquanto carrega os dados
  if (loading) {
    return (
      <div className="flex items-center justify-center h-48" role="status">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
          aria-label="Carregando detalhes..."
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-900">
          Detalhes da Assinatura
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
          aria-label="Fechar detalhes"
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

      {subscription && plan ? (
        <div className="space-y-6">
          {/* Plano Atual */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Plano Atual</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome do Plano</p>
                <p className="font-medium text-gray-900">{plan.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preço</p>
                <p className="font-medium text-gray-900">
                  R$ {plan.price.toFixed(2)}/mês
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                  role="status"
                >
                  {subscription.status === 'active' ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Próxima Cobrança</p>
                <p className="font-medium text-gray-900">
                  {subscription.next_billing_date
                    ? new Date(subscription.next_billing_date).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Recursos do Plano */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recursos Incluídos</h4>
              <ul className="space-y-2" role="list">
                {Object.entries(plan.features || {}).map(([feature, enabled]) => (
                  <li key={feature} className="flex items-center text-sm">
                    <span 
                      className={`mr-2 ${enabled ? 'text-green-500' : 'text-red-500'}`}
                      aria-hidden="true"
                    >
                      {enabled ? '✓' : '✗'}
                    </span>
                    <span className={enabled ? '' : 'line-through'}>
                      {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Limites do Plano */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Limites do Plano</h4>
              <ul className="space-y-2" role="list">
                {Object.entries(plan.limits || {}).map(([limit, value]) => (
                  <li key={limit} className="flex items-center justify-between text-sm">
                    <span>{limit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span className="font-medium">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Histórico de Alterações */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Histórico de Alterações</h3>
            <div className="space-y-4">
              {history.map((entry) => (
                <div 
                  key={entry.id} 
                  className="border-l-4 border-primary-500 pl-4 py-2"
                  role="listitem"
                >
                  <p className="text-sm text-gray-500">
                    {new Date(entry.changed_at).toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {entry.change_type === 'status_change'
                      ? `Status alterado de ${entry.previous_status} para ${entry.new_status}`
                      : entry.change_type === 'plan_change'
                      ? 'Plano alterado'
                      : 'Outras alterações'}
                  </p>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma alteração registrada</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          Nenhuma assinatura ativa encontrada para este salão.
        </div>
      )}
    </div>
  );
}