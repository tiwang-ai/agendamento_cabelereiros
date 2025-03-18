import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import EstablishmentForm from '@/components/admin/EstablishmentForm';
import SubscriptionDetails from '@/components/admin/SubscriptionDetails';
import SubscriptionPlanForm from '@/components/admin/SubscriptionPlanForm';

interface Establishment {
  id: string;
  name: string;
  owner_id: string;
  owner_email: string;
  address: string | null;
  phones: string[] | null;
  active: boolean;
  plan_name: string | null;
  subscription_status: string | null;
}

export default function Establishments() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [filteredEstablishments, setFilteredEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSubscription, setShowSubscription] = useState<string | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEstablishments = async () => {
    try {
      const { data, error } = await supabase
        .from('salon_details')
        .select('*')
        .order('name');

      if (error) throw error;
      setEstablishments(data || []);
      setFilteredEstablishments(data || []);
    } catch (error) {
      console.error('Error fetching establishments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEstablishments(establishments);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = establishments.filter(establishment => 
      establishment.id.toLowerCase().includes(searchTermLower) ||
      establishment.name.toLowerCase().includes(searchTermLower) ||
      establishment.owner_email.toLowerCase().includes(searchTermLower) ||
      establishment.phones?.some(phone => phone.includes(searchTerm))
    );
    setFilteredEstablishments(filtered);
  }, [searchTerm, establishments]);

  const handleEdit = (establishment: Establishment) => {
    setSelectedEstablishment(establishment);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('salons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchEstablishments();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting establishment:', error);
      alert('Error deleting establishment. Please try again.');
    }
  };

  const handleSelectPlan = (establishment: Establishment) => {
    setSelectedEstablishment(establishment);
    setShowPlanForm(true);
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
        <h1 className="text-2xl font-bold text-gray-900">Establishments</h1>
        <button
          onClick={() => {
            setSelectedEstablishment(null);
            setShowForm(true);
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          New Establishment
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID, name, email, or phone..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phones
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEstablishments.map((establishment) => (
              <tr key={establishment.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {establishment.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {establishment.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {establishment.owner_email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {establishment.address || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {establishment.phones?.join(', ') || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    establishment.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {establishment.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col">
                      {establishment.plan_name ? (
                        <>
                          <span className="text-sm font-medium text-gray-900">
                            {establishment.plan_name}
                          </span>
                          <button
                            onClick={() => setShowSubscription(establishment.id)}
                            className="text-xs text-primary-600 hover:text-primary-900 mt-1"
                          >
                            View details
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleSelectPlan(establishment)}
                          className="text-sm text-primary-600 hover:text-primary-900"
                        >
                          Select plan
                        </button>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <Link
                      to={`/admin/establishments/${establishment.id}/users`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Manage Users
                    </Link>
                    <button
                      onClick={() => handleEdit(establishment)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(establishment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Forms and Modals */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <EstablishmentForm
              establishment={selectedEstablishment}
              onClose={() => {
                setShowForm(false);
                setSelectedEstablishment(null);
              }}
              onSuccess={() => {
                fetchEstablishments();
                setShowForm(false);
                setSelectedEstablishment(null);
              }}
            />
          </div>
        </div>
      )}

      {showSubscription && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <SubscriptionDetails
              salonId={showSubscription}
              onClose={() => setShowSubscription(null)}
            />
          </div>
        </div>
      )}

      {showPlanForm && selectedEstablishment && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <SubscriptionPlanForm
              salonId={selectedEstablishment.id}
              onClose={() => {
                setShowPlanForm(false);
                setSelectedEstablishment(null);
              }}
              onSuccess={() => {
                fetchEstablishments();
                setShowPlanForm(false);
                setSelectedEstablishment(null);
              }}
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this establishment? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}