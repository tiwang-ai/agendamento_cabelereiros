// src/pages/admin/Plans.tsx
import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  Typography,
  Button,
  Dialog,
  TextField,
  Box,
  CircularProgress
} from '@mui/material';
import { DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { PlansService } from '../../services/plans';

interface Plan {
  id: number;
  name: string;
  price: number;
  features: string[];
  maxProfessionals: number;
  active: boolean;
}

const PlansManagement = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    maxProfessionals: '',
    features: ''
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await PlansService.getAll();
      setPlans(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const planData = {
        name: formData.name,
        price: parseFloat(formData.price),
        maxProfessionals: parseInt(formData.maxProfessionals),
        features: formData.features.split('\n').filter(f => f.trim()),
        active: true
      };

      if (selectedPlan) {
        await PlansService.update(selectedPlan.id, planData);
      } else {
        await PlansService.create(planData);
      }
      
      loadPlans();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 4 }}>
        Gerenciamento de Planos
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Button 
            variant="contained" 
            onClick={() => setOpenDialog(true)}
            sx={{ mb: 3 }}
          >
            Adicionar Novo Plano
          </Button>

          <Grid container spacing={3}>
            {plans.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card sx={{ p: 3 }}>
                  <Typography variant="h5">{plan.name}</Typography>
                  <Typography variant="h4" sx={{ my: 2 }}>
                    R$ {plan.price}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Até {plan.maxProfessionals} profissionais
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {plan.features.map((feature, index) => (
                      <Typography key={index} variant="body2">
                        • {feature}
                      </Typography>
                    ))}
                  </Box>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setOpenDialog(true);
                    }}
                  >
                    Editar
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedPlan ? 'Editar Plano' : 'Novo Plano'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Plano"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Preço"
            type="number"
            fullWidth
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Máximo de Profissionais"
            type="number"
            fullWidth
            value={formData.maxProfessionals}
            onChange={(e) => setFormData({ ...formData, maxProfessionals: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Features (uma por linha)"
            multiline
            rows={4}
            fullWidth
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            helperText="Digite uma feature por linha"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PlansManagement;