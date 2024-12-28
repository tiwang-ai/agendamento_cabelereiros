// src/pages/admin/Services.tsx
import { useState } from 'react';

import api from '../../services/api';

interface SystemService {
  id: number;
  name: string;
  defaultDuration?: number;
  defaultPrice?: number;
}

const SystemServicesManagement = () => {
  const [services, setServices] = useState<SystemService[]>([]);
  
  // CRUD completo dos serviços base
  const handleCreateService = async (data: Omit<SystemService, 'id'>) => {
    try {
      const response = await api.post('/api/system-services/', data);
      setServices([...services, response.data]);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
    }
  };

  // ... resto da implementação
};