import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Establishment {
  id: string;
  name: string;
  owner_id: string;
  address: string | null;
  phones: string[] | null;
  active: boolean;
}

interface EstablishmentFormProps {
  establishment?: Establishment | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  address: string;
  ownerEmail: string;
}

export default function EstablishmentForm({ establishment, onClose, onSuccess }: EstablishmentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: establishment ? {
      name: establishment.name,
      address: establishment.address || '',
    } : undefined
  });
  const [phones, setPhones] = useState<string[]>(establishment?.phones || []);
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPhone = () => {
    if (newPhone && !phones.includes(newPhone)) {
      setPhones([...phones, newPhone]);
      setNewPhone('');
    }
  };

  const handleRemovePhone = (phone: string) => {
    setPhones(phones.filter(p => p !== phone));
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      if (establishment) {
        // Update existing establishment
        const { error: updateError } = await supabase
          .from('salons')
          .update({
            name: data.name,
            address: data.address || null,
            phones: phones.length > 0 ? phones : null
          })
          .eq('id', establishment.id);

        if (updateError) throw updateError;
      } else {
        // Create new user first
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.ownerEmail,
          password: 'changeme123', // Temporary password
          options: {
            data: {
              name: data.name
            }
          }
        });

        if (authError) throw authError;

        if (!authData.user?.id) {
          throw new Error('Failed to create user');
        }

        // Create salon
        const { error: salonError } = await supabase
          .from('salons')
          .insert([{
            name: data.name,
            owner_id: authData.user.id,
            address: data.address || null,
            phones: phones.length > 0 ? phones : null,
            active: true
          }]);

        if (salonError) throw salonError;
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving establishment:', error);
      setError(error.message || 'Error saving establishment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-lg font-medium text-gray-900">
          {establishment ? 'Edit' : 'New'} Establishment
        </h2>
        <button
          type="button"
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

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {!establishment && (
        <div>
          <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700">
            Owner Email
          </label>
          <input
            type="email"
            id="ownerEmail"
            {...register('ownerEmail', {
              required: 'Owner email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.ownerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.ownerEmail.message}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          id="address"
          {...register('address')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Numbers
        </label>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="tel"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              placeholder="Add phone number"
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
                  type="button"
                  onClick={() => handleRemovePhone(phone)}
                  className="text-red-600 hover:text-red-700"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : establishment ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}