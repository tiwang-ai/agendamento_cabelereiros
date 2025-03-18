import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ServiceForm from '@/components/ServiceForm';
import ServiceEditForm from '@/components/ServiceEditForm';
import { Database } from '@/lib/database.types';

type Service = Database['public']['Tables']['services']['Row'];

export default function ClientServices() {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchServices = async () => {
    if (!user) return;

    try {
      const { data: salonData } = await supabase
        .from('salons')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (salonData) {
        const { data } = await supabase
          .from('services')
          .select('*')
          .eq('salon_id', salonData.id)
          .eq('active', true)
          .order('name');

        setServices(data || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setShowEditForm(true);
  };

  const handleRemove = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .update({ active: false })
        .eq('id', serviceId);

      if (error) throw error;

      fetchServices();
    } catch (error) {
      console.error('Error removing service:', error);
      alert('Erro ao remover serviço. Por favor, tente novamente.');
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
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Novo Serviço
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Novo Serviço</h2>
            <ServiceForm
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                fetchServices();
                setShowForm(false);
              }}
            />
          </div>
        </div>
      )}

      {showEditForm && selectedService && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Editar Serviço</h2>
            <ServiceEditForm
              service={selectedService}
              onClose={() => {
                setShowEditForm(false);
                setSelectedService(null);
              }}
              onSuccess={() => {
                fetchServices();
                setShowEditForm(false);
                setSelectedService(null);
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
            <p className="text-gray-500 mt-2">Duração: {service.duration}min</p>
            <p className="text-primary-600 font-bold mt-2">R$ {service.price.toFixed(2)}</p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleEdit(service)}
                className="text-primary-600 hover:text-primary-900"
              >
                Editar
              </button>
              <button
                onClick={() => handleRemove(service.id)}
                className="text-red-600 hover:text-red-900"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}