// src/pages/settings/Settings.tsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  Tabs,
  Tab,
  FormControlLabel,
} from '@mui/material';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import WhatsAppConnection from './WhatsAppConnection';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    emailNotifications: true,
    whatsappNotifications: true,
    autoConfirmAppointments: false,
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR'
  });

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.ChangeEvent<unknown>, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleProfileSubmit = async () => {
    try {
      await api.put('/api/users/profile/', profile);
      // Mostrar mensagem de sucesso
    } catch (error) {
      // Mostrar erro
    }
  };

  const handleSettingsSubmit = async () => {
    try {
      await api.put('/api/users/settings/', settings);
      // Mostrar mensagem de sucesso
    } catch (error) {
      // Mostrar erro
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Configurações
        </Typography>
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Perfil" />
          <Tab label="Notificações" />
          <Tab label="WhatsApp" />
        </Tabs>

        <Grid container spacing={2}>
          {tabValue === 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Perfil
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Alterar Senha
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Senha Atual"
                    value={profile.currentPassword}
                    onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Nova Senha"
                    value={profile.newPassword}
                    onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirmar Nova Senha"
                    value={profile.confirmPassword}
                    onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    onClick={handleProfileSubmit}
                    fullWidth
                  >
                    Salvar Alterações
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notificações
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notificationsEnabled}
                        onChange={handleSettingChange('notificationsEnabled')}
                      />
                    }
                    label="Ativar Notificações"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={handleSettingChange('emailNotifications')}
                      />
                    }
                    label="Notificações por Email"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.whatsappNotifications}
                        onChange={handleSettingChange('whatsappNotifications')}
                      />
                    }
                    label="Notificações por WhatsApp"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.autoConfirmAppointments}
                        onChange={handleSettingChange('autoConfirmAppointments')}
                      />
                    }
                    label="Confirmar Agendamentos Automaticamente"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    onClick={handleSettingsSubmit}
                    fullWidth
                  >
                    Salvar Configurações
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}

          {tabValue === 2 && (
            <Grid item xs={12}>
              <WhatsAppConnection />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default Settings;