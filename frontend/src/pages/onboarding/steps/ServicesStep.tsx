// frontend/src/pages/onboarding/steps/ServicesStep.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import api from '../../../services/api';
import { OnboardingData } from '../../../types/onboarding';

interface Props {
  data: OnboardingData;
  onUpdate: (data: OnboardingData) => void;
}

interface SystemService {
  id: number;
  name: string;
  default_duration: number;
  default_price: number;
}

export const ServicesStep = ({ data, onUpdate }: Props) => {
  const [systemServices, setSystemServices] = useState<SystemService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemServices();
  }, []);

  const loadSystemServices = async () => {
    try {
      const response = await api.get('/system-services/');
      setSystemServices(response.data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelection = (service: SystemService) => {
    const newServices = [...data.services];
    const index = newServices.findIndex(s => s.systemServiceId === service.id);

    if (index >= 0) {
      newServices.splice(index, 1);
    } else {
      newServices.push({
        systemServiceId: service.id,
        price: service.default_price,
        duration: service.default_duration
      });
    }

    onUpdate({
      ...data,
      services: newServices
    });
  };

  const handlePriceChange = (serviceId: number, value: string) => {
    const newServices = [...data.services];
    const index = newServices.findIndex(s => s.systemServiceId === serviceId);
    if (index >= 0) {
      newServices[index] = {
        ...newServices[index],
        price: parseFloat(value) || undefined
      };
      onUpdate({
        ...data,
        services: newServices
      });
    }
  };

  const handleDurationChange = (serviceId: number, value: string) => {
    const newServices = [...data.services];
    const index = newServices.findIndex(s => s.systemServiceId === serviceId);
    if (index >= 0) {
      newServices[index] = {
        ...newServices[index],
        duration: parseInt(value) || undefined
      };
      onUpdate({
        ...data,
        services: newServices
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Selecione os Serviços
      </Typography>

      <Grid container spacing={2}>
        {systemServices.map(service => {
          const selectedService = data.services.find(
            s => s.systemServiceId === service.id
          );
          const isSelected = !!selectedService;

          return (
            <Grid item xs={12} sm={6} key={service.id}>
              <Card>
                <CardContent>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleServiceSelection(service)}
                      />
                    }
                    label={service.name}
                  />

                  {isSelected && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Preço (opcional)"
                        type="number"
                        value={selectedService.price || ''}
                        onChange={(e) => handlePriceChange(service.id, e.target.value)}
                        helperText={`Preço sugerido: R$ ${service.default_price}`}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Duração em minutos (opcional)"
                        type="number"
                        value={selectedService.duration || ''}
                        onChange={(e) => handleDurationChange(service.id, e.target.value)}
                        helperText={`Duração sugerida: ${service.default_duration} min`}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ServicesStep;