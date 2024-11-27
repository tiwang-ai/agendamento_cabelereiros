// frontend/src/pages/admin/BotConfig.tsx
import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';
import api from '../../services/api';

const BotConfig = () => {
  const [config, setConfig] = useState({
    support_whatsapp: '',
    status: 'disconnected'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.get('/admin/bot-config/');
      setConfig(response.data);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post('/admin/bot-config/', config);
      loadConfig();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      setError('Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Configuração do Bot de Suporte
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="WhatsApp de Suporte"
            value={config.support_whatsapp}
            onChange={(e) => setConfig({ ...config, support_whatsapp: e.target.value })}
            helperText="Formato: 5511999999999"
          />

          <Button 
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            Salvar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BotConfig;