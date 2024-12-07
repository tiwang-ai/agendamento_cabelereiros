// frontend/src/pages/professional/Profile.tsx
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Box,
  Alert,
} from '@mui/material';
import { useState, useEffect, ChangeEvent } from 'react';

import api from '../../services/api';

interface ProfileData {
  nome: string;
  especialidade: string;
  telefone: string;
  bio: string;
  foto: string | null;
}

const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    nome: '',
    especialidade: '',
    telefone: '',
    bio: '',
    foto: null
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/professional/profile/');
      setProfileData(response.data);
    } catch (error) {
      setError('Erro ao carregar perfil');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.put('/professional/profile/', profileData);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      setError('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);

    try {
      const response = await api.post('/professional/profile/photo/', formData);
      setProfileData(prev => ({ ...prev, foto: response.data.foto }));
      setSuccess('Foto atualizada com sucesso!');
    } catch (error) {
      setError('Erro ao atualizar foto');
    }
  };

  const handleInputChange = (field: keyof ProfileData) => (e: ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Meu Perfil
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={profileData.foto || undefined}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <Button
                variant="outlined"
                component="label"
                sx={{ mb: 2 }}
              >
                Alterar Foto
                <Box
                  component="input"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={profileData.nome}
                    onChange={handleInputChange('nome')}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Especialidade"
                    value={profileData.especialidade}
                    onChange={handleInputChange('especialidade')}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={profileData.telefone}
                    onChange={handleInputChange('telefone')}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={4}
                    value={profileData.bio}
                    onChange={handleInputChange('bio')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;