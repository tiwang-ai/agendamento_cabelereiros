/**
 * Configurações do Salão
 * 
 * Este componente permite ao proprietário do salão gerenciar suas configurações,
 * incluindo informações básicas, telefones e horários de funcionamento.
 * Utiliza dados mockados enquanto a integração com backend não está disponível.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Salon {
  id: string;
  name: string;
  address: string | null;
  phones: string[] | null;
  general_info: string | null;
  business_hours: BusinessHour[];
}

interface BusinessHour {
  day: string;
  isOpen: boolean;
  periods: { open: string; close: string }[];
}

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
];

const DEFAULT_BUSINESS_HOURS: BusinessHour[] = DAYS_OF_WEEK.map(day => ({
  day,
  isOpen: day !== 'Domingo',
  periods: [{ open: '09:00', close: '18:00' }]
}));

/**
 * Dados mockados para simular a resposta da API
 */
const MOCK_SALON: Salon = {
  id: 'salon-123',
  name: 'Salão de Beleza Exemplo',
  address: 'Rua Exemplo, 123 - Bairro, Cidade - UF',
  phones: ['(11) 99999-8888', '(11) 2222-3333'],
  general_info: 'Salão especializado em cortes femininos e masculinos, com equipe qualificada e ambiente agradável.',
  business_hours: DEFAULT_BUSINESS_HOURS
};

export default function Settings() {
  const { user } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Salon>>({});
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(DEFAULT_BUSINESS_HOURS);
  const [phones, setPhones] = useState<string[]>([]);
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalon = async () => {
      if (!user) return;

      try {
        // Simulando delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Usando dados mockados
        const salonData = MOCK_SALON;

        setSalon(salonData);
        setFormData(salonData);
        setBusinessHours(salonData.business_hours || DEFAULT_BUSINESS_HOURS);
        setPhones(salonData.phones || []);
        setError(null);
      } catch (error) {
        console.error('Erro ao buscar informações do salão:', error);
        setError('Erro ao carregar informações do salão');
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, [user]);

  const handleSave = async () => {
    if (!salon || !user) return;

    try {
      setLoading(true);
      
      // Simulando delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulando atualização de dados
      console.log('Dados sendo salvos:', {
        ...formData,
        business_hours: businessHours,
        phones
      });
      
      // Atualizando estado local com os novos dados
      setIsEditing(false);
      setSalon({ ...salon, ...formData, business_hours: businessHours, phones });
      
      // Feedback ao usuário
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar salão:', error);
      setError('Erro ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhone = () => {
    if (newPhone && !phones.includes(newPhone)) {
      setPhones([...phones, newPhone]);
      setNewPhone('');
    }
  };

  const handleRemovePhone = (phone: string) => {
    setPhones(phones.filter(p => p !== phone));
  };

  const handleAddPeriod = (dayIndex: number) => {
    const updatedHours = [...businessHours];
    updatedHours[dayIndex].periods.push({ open: '09:00', close: '18:00' });
    setBusinessHours(updatedHours);
  };

  const handleRemovePeriod = (dayIndex: number, periodIndex: number) => {
    const updatedHours = [...businessHours];
    updatedHours[dayIndex].periods.splice(periodIndex, 1);
    setBusinessHours(updatedHours);
  };

  const handlePeriodChange = (dayIndex: number, periodIndex: number, field: 'open' | 'close', value: string) => {
    const updatedHours = [...businessHours];
    updatedHours[dayIndex].periods[periodIndex][field] = value;
    setBusinessHours(updatedHours);
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
        <h2 className="text-xl font-semibold text-gray-900">Configurações</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
          >
            Editar
          </button>
        ) : (
          <div className="space-x-4">
            <button
              onClick={() => setIsEditing(false)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              Salvar
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
        {/* Basic Information */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{salon?.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Endereço</label>
              {isEditing ? (
                <textarea
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{salon?.address || 'Nenhum endereço cadastrado'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Informações Gerais</label>
              {isEditing ? (
                <textarea
                  value={formData.general_info || ''}
                  onChange={e => setFormData({ ...formData, general_info: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{salon?.general_info || 'Nenhuma informação adicional'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Phone Numbers */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Telefones</h3>
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="Adicionar telefone"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={handleAddPhone}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {phones.map((phone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-gray-50 rounded-md">{phone}</span>
                    <button
                      onClick={() => handleRemovePhone(phone)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {phones.length > 0 ? (
                phones.map((phone, index) => (
                  <div key={index} className="px-3 py-2 bg-gray-50 rounded-md">
                    {phone}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Nenhum telefone cadastrado</p>
              )}
            </div>
          )}
        </div>

        {/* Business Hours */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Horário de Funcionamento</h3>
          <div className="space-y-4">
            {businessHours.map((day, dayIndex) => (
              <div key={day.day} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{day.day}</span>
                  {isEditing && (
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={day.isOpen}
                        onChange={e => {
                          const updatedHours = [...businessHours];
                          updatedHours[dayIndex].isOpen = e.target.checked;
                          setBusinessHours(updatedHours);
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Aberto</span>
                    </label>
                  )}
                </div>
                {day.isOpen ? (
                  <div className="space-y-2">
                    {day.periods.map((period, periodIndex) => (
                      <div key={periodIndex} className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <input
                              type="time"
                              value={period.open}
                              onChange={e => handlePeriodChange(dayIndex, periodIndex, 'open', e.target.value)}
                              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            <span>até</span>
                            <input
                              type="time"
                              value={period.close}
                              onChange={e => handlePeriodChange(dayIndex, periodIndex, 'close', e.target.value)}
                              className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            {day.periods.length > 1 && (
                              <button
                                onClick={() => handleRemovePeriod(dayIndex, periodIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span>
                            {period.open} até {period.close}
                          </span>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        onClick={() => handleAddPeriod(dayIndex)}
                        className="mt-2 inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Adicionar Horário
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Fechado</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}