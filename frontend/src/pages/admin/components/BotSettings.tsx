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

const BotSettings = () => {
    const [settings, setSettings] = useState<BotSettingsData>({
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
        }
    });
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await BotConfigService.getBotSettings();
            setSettings(data);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await BotConfigService.saveBotSettings(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            {saved && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Configurações salvas com sucesso!
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.bot_ativo}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    bot_ativo: e.target.checked
                                })}
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
                        onChange={(e) => setSettings({
                            ...settings,
                            prompt_template: e.target.value
                        })}
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
                                onChange={(e) => setSettings({
                                    ...settings,
                                    evolution_settings: {
                                        ...settings.evolution_settings,
                                        reject_calls: e.target.checked
                                    }
                                })}
                            />
                        }
                        label="Rejeitar Chamadas"
                    />
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