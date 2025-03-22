import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProfessionalForm from '@/components/ProfessionalForm';
import ProfessionalEditForm from '@/components/ProfessionalEditForm';
import ProfessionalSchedule from '@/components/ProfessionalSchedule';
import { Professional } from '@/types';

// Dados mockados para simular os profissionais do salão
const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@exemplo.com',
    phone: '(11) 95555-1234',
    salon_id: '1',
    specialties: ['Corte Feminino', 'Coloração', 'Mechas'],
    color: '#4F46E5',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@exemplo.com',
    phone: '(11) 95555-2345',
    salon_id: '1',
    specialties: ['Corte Masculino', 'Barba'],
    color: '#DC2626',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Beatriz Santos',
    email: 'beatriz.santos@exemplo.com',
    phone: '(11) 95555-3456',
    salon_id: '1',
    specialties: ['Manicure', 'Pedicure', 'Unhas em Gel'],
    color: '#7C3AED',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Marcelo Pereira',
    email: 'marcelo.pereira@exemplo.com',
    phone: '(11) 95555-4567',
    salon_id: '1',
    specialties: ['Corte Masculino', 'Barba', 'Coloração Masculina'],
    color: '#059669',
    active: true,
    created_at: new Date().toISOString(),
  },
];

/**
 * Componente para gestão de profissionais do salão
 */
export default function Professionals() {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  /**
   * Busca os profissionais do salão (simulada com dados mockados)
   */
  const fetchProfessionals = async () => {
    if (!user) return;

    try {
      // Simulando um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Usando dados mockados
      setProfessionals(MOCK_PROFESSIONALS);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [user]);

  /**
   * Função para editar um profissional
   */
  const handleEdit = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowEditForm(true);
  };

  /**
   * Função para visualizar a agenda de um profissional
   */
  const handleViewSchedule = (professional: Professional) => {
    setSelectedProfessional(professional);
    setShowSchedule(true);
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
        <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Novo Profissional
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Novo Profissional</h2>
            <ProfessionalForm
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                fetchProfessionals();
                setShowForm(false);
              }}
            />
          </div>
        </div>
      )}

      {showEditForm && selectedProfessional && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Editar Profissional</h2>
            <ProfessionalEditForm
              professional={selectedProfessional}
              onClose={() => {
                setShowEditForm(false);
                setSelectedProfessional(null);
              }}
              onSuccess={() => {
                fetchProfessionals();
                setShowEditForm(false);
                setSelectedProfessional(null);
              }}
            />
          </div>
        </div>
      )}

      {showSchedule && selectedProfessional && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProfessionalSchedule
              professional={selectedProfessional}
              onClose={() => {
                setShowSchedule(false);
                setSelectedProfessional(null);
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {professionals.map((professional) => (
          <div key={professional.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-4">
              <div 
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: professional.color || '#4F46E5',
                  color: 'white'
                }}
              >
                <span className="font-bold text-lg">
                  {professional.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
                <p className="text-gray-500">{professional.email || 'Sem email'}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: professional.color || '#4F46E5' }}
                ></div>
                <span className="text-sm text-gray-600">Cor do Calendário</span>
              </div>
              <p className="text-sm text-gray-500">Especialidades:</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {professional.specialties?.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleEdit(professional)}
                className="text-primary-600 hover:text-primary-900"
              >
                Editar
              </button>
              <button
                onClick={() => handleViewSchedule(professional)}
                className="text-primary-600 hover:text-primary-900"
              >
                Ver Agenda
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}