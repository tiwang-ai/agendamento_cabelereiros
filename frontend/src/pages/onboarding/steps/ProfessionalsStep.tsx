// frontend/src/pages/onboarding/steps/ProfessionalsStep.tsx
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Chip
} from '@mui/material';
import { useState } from 'react';

import { OnboardingData } from '../../../types/onboarding';

interface Professional {
  name: string;
  specialties: string[];
  phone: string;
}

interface Props {
  data: OnboardingData;
  onUpdate: (data: OnboardingData) => void;
}

const ProfessionalsStep = ({ data, onUpdate }: Props) => {
  const [newProfessional, setNewProfessional] = useState({
    name: '',
    specialties: [''],
    phone: ''
  });

  const handleAddProfessional = () => {
    onUpdate({
      ...data,
      professionals: [...data.professionals, newProfessional]
    });
    setNewProfessional({ name: '', specialties: [''], phone: '' });
  };

  const handleRemoveProfessional = (index: number) => {
    const newProfessionals = [...data.professionals];
    newProfessionals.splice(index, 1);
    onUpdate({
      ...data,
      professionals: newProfessionals
    });
  };

  const handleAddSpecialty = () => {
    setNewProfessional({
      ...newProfessional,
      specialties: [...newProfessional.specialties, '']
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Profissionais
      </Typography>

      {/* Lista de profissionais adicionados */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {data.professionals.map((professional, index) => (
          <Grid item xs={12} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{professional.name}</Typography>
                  <IconButton onClick={() => handleRemoveProfessional(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Typography color="textSecondary">{professional.phone}</Typography>
                <Box sx={{ mt: 1 }}>
                  {professional.specialties.map((specialty, idx) => (
                    <Chip key={idx} label={specialty} sx={{ mr: 1 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Formulário para adicionar novo profissional */}
      <Card sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Adicionar Profissional
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nome"
              value={newProfessional.name}
              onChange={(e) => setNewProfessional({
                ...newProfessional,
                name: e.target.value
              })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefone"
              value={newProfessional.phone}
              onChange={(e) => setNewProfessional({
                ...newProfessional,
                phone: e.target.value
              })}
            />
          </Grid>
          {newProfessional.specialties.map((specialty, index) => (
            <Grid item xs={12} key={index}>
              <TextField
                fullWidth
                label={`Especialidade ${index + 1}`}
                value={specialty}
                onChange={(e) => {
                  const newSpecialties = [...newProfessional.specialties];
                  newSpecialties[index] = e.target.value;
                  setNewProfessional({
                    ...newProfessional,
                    specialties: newSpecialties
                  });
                }}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddSpecialty}
          >
            Adicionar Especialidade
          </Button>
          <Button
            variant="contained"
            onClick={handleAddProfessional}
            disabled={!newProfessional.name || !newProfessional.phone}
          >
            Adicionar Profissional
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default ProfessionalsStep;