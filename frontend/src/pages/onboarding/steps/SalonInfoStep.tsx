// frontend/src/pages/onboarding/steps/SalonInfoStep.tsx
import { Box, TextField, Typography, Grid } from '@mui/material';
import { OnboardingData } from '../../../types/onboarding';

interface Props {
  data: OnboardingData;
  onUpdate: (data: OnboardingData) => void;
}

const SalonInfoStep = ({ data, onUpdate }: Props) => {
  const handleChange = (field: keyof typeof data.salonInfo) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onUpdate({
      ...data,
      salonInfo: {
        ...data.salonInfo,
        [field]: e.target.value
      }
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Informações do Salão
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Nome do Salão"
            value={data.salonInfo.name}
            onChange={handleChange('name')}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Endereço"
            value={data.salonInfo.address}
            onChange={handleChange('address')}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Telefone"
            value={data.salonInfo.phone}
            onChange={handleChange('phone')}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Horário de Funcionamento"
            value={data.salonInfo.openingHours}
            onChange={handleChange('openingHours')}
            placeholder="Ex: 09:00 às 19:00"
            required
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalonInfoStep;