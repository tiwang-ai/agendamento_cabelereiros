import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_end: string | null;
  next_billing_date: string | null;
  payment_status: string;
  last_payment_date: string | null;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  features: any;
  limits: any;
}

interface SubscriptionHistory {
  id: string;
  change_type: string;
  previous_status: string | null;
  new_status: string | null;
  changed_at: string;
  details: any;
}

interface SubscriptionDetailsProps {
  salonId: string;
  onClose: () => void;
}

export default function SubscriptionDetails({ salonId, onClose }: SubscriptionDetailsProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        // Fetch current subscription
        const { data: subscriptions, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('salon_id', salonId)
          .eq('status', 'active');

        if (subscriptionError) throw subscriptionError;

        const currentSubscription = subscriptions?.[0] || null;
        setSubscription(currentSubscription);

        if (currentSubscription) {
          // Fetch plan details
          const { data: planData, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', currentSubscription.plan_id)
            .single();

          if (planError) throw planError;
          setPlan(planData);

          // Fetch subscription history
          const { data: historyData, error: historyError } = await supabase
            .from('subscription_history')
            .select('*')
            .eq('salon_id', salonId)
            .order('changed_at', { ascending: false });

          if (historyError) throw historyError;
          setHistory(historyData || []);
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
        setError('Error loading subscription details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [salonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold text-gray-900">
          Subscription Details
        </h2>
        <button
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

      {subscription && plan ? (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Plan Name</p>
                <p className="font-medium text-gray-900">{plan.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-medium text-gray-900">
                  R$ {plan.price.toFixed(2)}/month
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {subscription.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Next Billing</p>
                <p className="font-medium text-gray-900">
                  {subscription.next_billing_date
                    ? new Date(subscription.next_billing_date).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Plan Features */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Included Features</h4>
              <ul className="space-y-2">
                {Object.entries(plan.features || {}).map(([feature, enabled]) => (
                  <li key={feature} className="flex items-center text-sm">
                    <span className={`mr-2 ${enabled ? 'text-green-500' : 'text-red-500'}`}>
                      {enabled ? '✓' : '✗'}
                    </span>
                    {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </li>
                ))}
              </ul>
            </div>

            {/* Plan Limits */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Plan Limits</h4>
              <ul className="space-y-2">
                {Object.entries(plan.limits || {}).map(([limit, value]) => (
                  <li key={limit} className="flex items-center justify-between text-sm">
                    <span>{limit.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span className="font-medium">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Subscription History */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change History</h3>
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="border-l-4 border-primary-500 pl-4 py-2">
                  <p className="text-sm text-gray-500">
                    {new Date(entry.changed_at).toLocaleString()}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {entry.change_type === 'status_change'
                      ? `Status changed from ${entry.previous_status} to ${entry.new_status}`
                      : entry.change_type === 'plan_change'
                      ? 'Plan changed'
                      : 'Other changes'}
                  </p>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-sm text-gray-500">No changes recorded</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative">
          No active subscription found for this establishment.
        </div>
      )}
    </div>
  );
}