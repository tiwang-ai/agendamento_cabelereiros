import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ServiceForm from '@/components/ServiceForm';
import ServiceEditForm from '@/components/ServiceEditForm';
import { Service } from '@/types';

// Dados mockados para simular os serviços do salão
const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte Masculino',
    description: 'Corte de cabelo masculino tradicional',
    price: 35.0,
    duration: 30,
    salon_id: '1',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Corte Feminino',
    description: 'Corte de cabelo feminino com finalização',
    price: 70.0,
    duration: 60,
    salon_id: '1',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Barba',
    description: 'Corte e modelagem de barba completo',
    price: 25.0,
    duration: 20,
    salon_id: '1',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Coloração',
    description: 'Serviço completo de coloração de cabelo',
    price: 120.0,
    duration: 90,
    salon_id: '1',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Hidratação',
    description: 'Tratamento de hidratação profunda',
    price: 80.0,
    duration: 45,
    salon_id: '1',
    active: true,
    created_at: new Date().toISOString(),
  },
];

/**
 * Componente para gerenciamento de serviços do salão
 */
export default function Services() {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  /**
   * Busca os serviços do salão (simulada com dados mockados)
   */
  const fetchServices = async () => {
    if (!user) return;

    try {
      // Simulando um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Usando dados mockados
      setServices(MOCK_SERVICES);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  /**
   * Função para editar um serviço
   */
  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setShowEditForm(true);
  };

  /**
   * Função para remover um serviço (marcar como inativo)
   */
  const handleRemove = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return;

    try {
      // Simulando um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Atualizando os serviços localmente
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === serviceId 
            ? { ...service, active: false } 
            : service
        ).filter(service => service.active)
      );
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
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
            {service.description && (
              <p className="text-gray-600 mt-1">{service.description}</p>
            )}
            <p className="text-gray-500 mt-2">Duração: {service.duration} min</p>
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