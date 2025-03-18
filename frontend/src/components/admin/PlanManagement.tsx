import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import SubscriptionPlanForm from './SubscriptionPlanForm';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  active: boolean;
}

export default function PlanManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .order('price');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // First check if there are any active subscriptions using this plan
      const { data: activeSubscriptions, error: checkError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('plan_id', id)
        .eq('status', 'active');

      if (checkError) throw checkError;

      if (activeSubscriptions && activeSubscriptions.length > 0) {
        alert('Não é possível excluir um plano que possui assinaturas ativas.');
        return;
      }

      // If no active subscriptions, proceed with the deletion
      const { error: deleteError } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Refresh the plans list
      fetchPlans();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Erro ao excluir plano. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white p-6 rounded-lg shadow-md">
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
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(plan.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {plan.description && (
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
            )}

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recursos</h4>
              <ul className="space-y-1">
                {Object.entries(plan.features || {}).map(([feature, enabled]) => (
                  <li key={feature} className="flex items-center text-sm">
                    <span className={`mr-2 ${enabled ? 'text-green-500' : 'text-red-500'}`}>
                      {enabled ? '✓' : '✗'}
                    </span>
                    {feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Limites</h4>
              <ul className="space-y-1">
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

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
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