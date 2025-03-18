import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Database } from '@/lib/database.types';

// ... (previous imports and type definitions remain the same)

export default function ProfessionalForm({ onClose, onSuccess }: ProfessionalFormProps) {
  // ... (previous state and hooks remain the same)

  useEffect(() => {
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

    fetchServices();
  }, [user]);

  // ... (rest of the component remains the same)
}