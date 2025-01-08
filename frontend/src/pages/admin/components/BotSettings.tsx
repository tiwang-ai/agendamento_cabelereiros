import {
    Box,
    TextField,
    Switch,
    FormControlLabel,
    Button,
    Alert,
    Typography,
    Grid
} from '@mui/material';
import { useState, useEffect } from 'react';
import { BotConfigService } from '../../../services/botConfig';
import type { BotSettingsData } from '../../../types/bot';
import { gerar_prompt_bot1 } from '../../../utils/prompts';

//URL padrão do webhook
const DEFAULT_WEBHOOK_URL = `${window.location.origin}/api/webhooks/support/`;

// Configurações padrão do webhook
const DEFAULT_WEBHOOK_EVENTS = [
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE",
    "SEND_MESSAGE",
    "CONNECTION_UPDATE",
    "QR_UPDATE"
];

// Estado inicial das configurações
const initialSettings: BotSettingsData = {
    bot_ativo: true,
    prompt_template: gerar_prompt_bot1(),
    attendance_mode: 'auto',
    evolution_settings: {
        reject_calls: true,
        read_messages: true,
        groups_ignore: true
    },
    horario_atendimento: {
        inicio: '09:00',
        fim: '18:00'
    },
    webhook_settings: {
        enabled: true,
        url: DEFAULT_WEBHOOK_URL,
        events: DEFAULT_WEBHOOK_EVENTS
    }
};

const BotSettings = () => {
    const [settings, setSettings] = useState<BotSettingsData>(initialSettings);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);
                const data = await BotConfigService.getBotSettings();
                if (data) {
                    setSettings({
                        ...initialSettings,
                        ...data,
                        evolution_settings: {
                            ...initialSettings.evolution_settings,
                            ...(data.evolution_settings || {})
                        },
                        webhook_settings: {
                            ...initialSettings.webhook_settings,
                            ...(data.webhook_settings || {})
                        }
                    });
                }
            } catch (error) {
                console.error('Erro ao carregar configurações:', error);
                setError('Erro ao carregar configurações');
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await BotConfigService.saveBotSettings(settings);
            setError(null);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Erro ao salvar:', err);
            setError('Falha ao salvar as configurações. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Configurações salvas com sucesso!
                </Alert>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.bot_ativo}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    bot_ativo: e.target.checked
                                }))}
                            />
                        }
                        label="Bot Ativo"
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Template do Prompt IA"
                        value={settings.prompt_template}
                        onChange={(e) => setSettings(prev => ({
                            ...prev,
                            prompt_template: e.target.value
                        }))}
                        helperText="Use {input} para indicar onde a mensagem do usuário será inserida"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Configurações da Evolution API
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.evolution_settings.reject_calls}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    evolution_settings: {
                                        ...prev.evolution_settings,
                                        reject_calls: e.target.checked
                                    }
                                }))}
                            />
                        }
                        label="Rejeitar Chamadas"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Configurações de Webhook
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.webhook_settings.enabled}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    webhook_settings: {
                                        ...prev.webhook_settings,
                                        enabled: e.target.checked
                                    }
                                }))}
                            />
                        }
                        label="Webhook Ativo"
                    />
                    
                    {settings.webhook_settings.enabled && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                URL do Webhook (configuração padrão):
                            </Typography>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    wordBreak: 'break-all',
                                    fontFamily: 'monospace'
                                }}
                            >
                                {DEFAULT_WEBHOOK_URL}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Esta URL é configurada automaticamente para integração com Evolution API e DeepInfra
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Eventos configurados:
                            </Typography>
                            <Box sx={{ pl: 2 }}>
                                {settings.webhook_settings.events.map((event) => (
                                    <Typography key={event} variant="body2">
                                        • {event}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Grid>

                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BotSettings;