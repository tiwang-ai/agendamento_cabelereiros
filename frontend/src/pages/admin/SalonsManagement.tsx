/**
 * Gerenciamento de Salões
 * 
 * Esta página permite ao administrador visualizar, adicionar, editar e excluir salões
 * no sistema. Todos os dados são mockados enquanto a conexão com o backend não está disponível.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SalonForm from '@/components/admin/SalonForm';
import SubscriptionDetails from '@/components/admin/SubscriptionDetails';
import SubscriptionPlanForm from '@/components/admin/SubscriptionPlanForm';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { SalonStatus, Salon } from '../../types';
import { salonService } from '../../services/salon';
import { Button, Dialog, Input, Message, Spinner } from '../../components/ui';
import { MOCK_SALONS } from '@/mocks';

/**
 * Componente SalonsManagement
 * 
 * Este componente gerencia a visualização e operações de salões no painel administrativo.
 * Permite listar, adicionar, editar e deletar salões, com suporte para filtragem e paginação.
 * 
 * @component
 */

const SalonsManagement: React.FC = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [salonToDelete, setSalonToDelete] = useState<Salon | null>(null);

  const ITEMS_PER_PAGE = 10;

  /**
   * Carrega os salões do serviço
   * Utiliza dados mockados para desenvolvimento
   */
  const fetchSalons = async () => {
    setLoading(true);
    try {
      // Simula a chamada à API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filtra os dados mockados com base no termo de busca
      let filteredSalons = MOCK_SALONS;
      if (searchTerm) {
        filteredSalons = MOCK_SALONS.filter(salon => 
          salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          salon.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          salon.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setTotalCount(filteredSalons.length);
      
      // Aplica paginação nos resultados
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const paginatedSalons = filteredSalons.slice(start, end);
      
      setSalons(paginatedSalons);
    } catch (error) {
      console.error('Erro ao buscar salões:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar salões. Por favor, tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, [searchTerm, currentPage]);

  /**
   * Manipula a adição ou edição de um salão
   */
  const handleSaveSalon = async (salon: Salon) => {
    setLoading(true);
    try {
      if (selectedSalon) {
        // Editar salão existente
        await salonService.updateSalon(salon);
        setMessage({ type: 'success', text: 'Salão atualizado com sucesso!' });
      } else {
        // Adicionar novo salão
        await salonService.createSalon(salon);
        setMessage({ type: 'success', text: 'Salão adicionado com sucesso!' });
      }
      
      setIsFormOpen(false);
      setSelectedSalon(null);
      fetchSalons();
    } catch (error) {
      console.error('Erro ao salvar salão:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar salão. Por favor, tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abre o diálogo de confirmação para deletar um salão
   */
  const handleDeleteClick = (salon: Salon) => {
    setSalonToDelete(salon);
    setIsConfirmDialogOpen(true);
  };

  /**
   * Realiza a exclusão do salão após confirmação
   */
  const handleConfirmDelete = async () => {
    if (!salonToDelete) return;
    
    setLoading(true);
    try {
      await salonService.deleteSalon(salonToDelete.id);
      setMessage({ type: 'success', text: 'Salão excluído com sucesso!' });
      fetchSalons();
    } catch (error) {
      console.error('Erro ao excluir salão:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir salão. Por favor, tente novamente.' });
    } finally {
      setLoading(false);
      setIsConfirmDialogOpen(false);
      setSalonToDelete(null);
    }
  };

  /**
   * Lida com a paginação
   */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /**
   * Renderiza o status do salão com cores diferentes
   */
  const renderStatus = (status: SalonStatus) => {
    switch (status) {
      case SalonStatus.ACTIVE:
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Ativo</span>;
      case SalonStatus.INACTIVE:
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inativo</span>;
      case SalonStatus.PENDING:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pendente</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
    }
  };

  /**
   * Renderiza o status da assinatura
   */
  const renderSubscriptionStatus = (isActive: boolean) => {
    return isActive 
      ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Ativa</span>
      : <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Inativa</span>;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Gerenciamento de Salões</h1>
      
      {message && (
        <Message 
          type={message.type} 
          message={message.text} 
          onClose={() => setMessage(null)} 
        />
      )}
      
      <div className="flex justify-between mb-6">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Buscar por nome, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <Button
          onClick={() => {
            setSelectedSalon(null);
            setIsFormOpen(true);
          }}
          color="primary"
        >
          <FaPlus className="mr-2" /> Adicionar Salão
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <Spinner size="lg" />
        </div>
      ) : salons.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhum salão encontrado.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proprietário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assinatura</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salons.map((salon) => (
                  <tr key={salon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {salon.logo_url && (
                          <img 
                            src={salon.logo_url} 
                            alt={`Logo ${salon.name}`} 
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Logo';
                            }}
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">{salon.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salon.owner_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salon.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salon.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderStatus(salon.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{renderSubscriptionStatus(salon.subscription_active)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSalon(salon);
                            setIsFormOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(salon)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginação */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Mostrando {salons.length} de {totalCount} salões
            </div>
            
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(totalCount / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Formulário de Adição/Edição */}
      <Dialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedSalon ? 'Editar Salão' : 'Adicionar Salão'}
      >
        <SalonForm
          salon={selectedSalon}
          onSave={handleSaveSalon}
          onCancel={() => setIsFormOpen(false)}
        />
      </Dialog>
      
      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        title="Confirmar Exclusão"
      >
        <div className="p-6">
          <p className="mb-6">
            Tem certeza que deseja excluir o salão <strong>{salonToDelete?.name}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setIsConfirmDialogOpen(false)}
              color="secondary"
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleConfirmDelete}
              color="danger"
            >
              Excluir
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SalonsManagement;