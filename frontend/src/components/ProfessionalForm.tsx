import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/mocks/data';
import { Service } from '@/types';

interface ProfessionalFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProfessionalForm({ onClose, onSuccess }: ProfessionalFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchServices = async () => {
      if (!user) return;

      try {
        // Simulando delay de rede
        await mockApi.delay(500);
        
        // Usando dados mockados
        const salonId = '1'; // ID fixo para teste
        const data = await mockApi.getServices(salonId);
        setServices(data || []);
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