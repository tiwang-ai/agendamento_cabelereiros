// src/pages/settings/Settings.tsx
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
  Box,
  Alert,
} from '@mui/material';
import React, { useState, ChangeEvent, useEffect } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { SalonBotService } from '../../services/salonBot';
import SalonWhatsAppConnection from './components/SalonWhatsAppConnection';

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

  const handleSettingChange = (setting: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleProfileChange = (field: keyof typeof profile) => (e: ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({
      ...prev,
      [field]: e.target.value
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
          <Tab label="Bot WhatsApp" />
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
                    onChange={handleProfileChange('name')}
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
                    onChange={handleProfileChange('phone')}
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
                    onChange={handleProfileChange('currentPassword')}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Nova Senha"
                    value={profile.newPassword}
                    onChange={handleProfileChange('newPassword')}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirmar Nova Senha"
                    value={profile.confirmPassword}
                    onChange={handleProfileChange('confirmPassword')}
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
              {user?.estabelecimento_id ? (
                <SalonWhatsAppConnection salonId={user.estabelecimento_id} />
              ) : (
                <Alert severity="warning">
                  ID do estabelecimento não encontrado.
                </Alert>
              )}
            </Grid>
          )}

          {tabValue === 3 && (
            <Grid item xs={12}>
              <BotSettings />
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

const BotSettings = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    bot_ativo: true,
    ignorar_grupos: true,
    tempo_debounce: 5,
    horario_atendimento_inicio: '09:00',
    horario_atendimento_fim: '18:00',
    dias_atendimento: [1,2,3,4,5],
    mensagem_fora_horario: '',
    mensagem_bot_desativado: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBotConfig();
  }, []);

  const loadBotConfig = async () => {
    try {
      const response = await SalonBotService.getBotConfig(user?.estabelecimento_id || '');
      setConfig(response);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleBotStatusChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const newStatus = event.target.checked;
      
      await SalonBotService.updateBotConfig(
        user?.estabelecimento_id || '', 
        { bot_ativo: newStatus }
      );
      
      setConfig(prev => ({
        ...prev,
        bot_ativo: newStatus
      }));
      
    } catch (error) {
      console.error('Erro ao atualizar status do bot:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Configurações do Bot
      </Typography>
      
      <FormControlLabel
        control={
          <Switch 
            checked={config.bot_ativo}
            onChange={handleBotStatusChange}
            disabled={isLoading}
          />
        }
        label={isLoading ? "Atualizando..." : "Bot Ativo"}
      />
      
      <FormControlLabel
        control={<Switch checked={config.ignorar_grupos} />}
        label="Ignorar Grupos"
      />
      
      <TextField
        label="Tempo Debounce (segundos)"
        type="number"
        value={config.tempo_debounce}
      />
      
      {/* Campos para horários e dias */}
      
      <TextField
        label="Mensagem Fora do Horário"
        multiline
        rows={3}
        value={config.mensagem_fora_horario}
      />
      
      <TextField
        label="Mensagem Bot Desativado"
        multiline
        rows={3}
        value={config.mensagem_bot_desativado}
      />
    </Box>
  );
};

export default Settings;