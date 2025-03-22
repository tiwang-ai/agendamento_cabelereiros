import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ClientForm from '@/components/ClientForm';
import ClientEditForm from '@/components/ClientEditForm';
import ClientHistory from '@/components/ClientHistory';
import { mockApi } from '@/lib/mockApi';

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  salon_id: string;
}

export default function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchClients = async () => {
    if (!user) return;

    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const salonData = await mockApi.getSalonByOwnerId(user.id);

      if (salonData) {
        const data = await mockApi.getClientsBySalonId(salonData.id);
        setClients(data || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEditForm(true);
  };

  const handleViewHistory = (client: Client) => {
    setSelectedClient(client);
    setShowHistory(true);
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
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          New Client
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">New Client</h2>
            <ClientForm
              onClose={() => setShowForm(false)}
              onSuccess={fetchClients}
            />
          </div>
        </div>
      )}

      {showEditForm && selectedClient && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Client</h2>
            <ClientEditForm
              client={selectedClient}
              onClose={() => {
                setShowEditForm(false);
                setSelectedClient(null);
              }}
              onSuccess={() => {
                fetchClients();
                setShowEditForm(false);
                setSelectedClient(null);
              }}
            />
          </div>
        </div>
      )}

      {showHistory && selectedClient && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ClientHistory
              client={selectedClient}
              onClose={() => {
                setShowHistory(false);
                setSelectedClient(null);
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {client.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.phone || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(client.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => handleEdit(client)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewHistory(client)}
                    className="ml-4 text-primary-600 hover:text-primary-900"
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}