// frontend/src/pages/admin/BotConfig.tsx
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useState, useEffect, ChangeEvent } from 'react';

import { BotConfigService } from '../../services/botConfig';

const BotConfig = () => {
    const [config, setConfig] = useState({
        support_whatsapp: '',
        status: 'disconnected'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [instanceStatus, setInstanceStatus] = useState<{
        created: boolean;
        webhook: boolean;
    }>({
        created: false,
        webhook: false
    });

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await BotConfigService.getConfig();
            setConfig(data);
        } catch (error) {
            console.error('Erro ao carregar configuração:', error);
            setError('Erro ao carregar configuração');
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await BotConfigService.saveConfig({
                support_whatsapp: config.support_whatsapp
            });
            
            setInstanceStatus({
                created: response.instance_created || false,
                webhook: response.webhook_configured || false
            });
            
            await loadConfig();
        } catch (error) {
            console.error('Erro ao salvar configuração:', error);
            setError('Erro ao salvar configuração');
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsAppChange = (e: ChangeEvent<HTMLInputElement>) => {
        setConfig({ ...config, support_whatsapp: e.target.value });
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
                        onChange={handleWhatsAppChange}
                        helperText="Formato: 5511999999999"
                        disabled={loading}
                    />

                    <Button 
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>

                    {config.status === 'connected' && (
                        <Alert severity="success">
                            Bot de suporte conectado e ativo
                        </Alert>
                    )}
                </Box>

                <Box sx={{ mt: 2 }}>
                    {instanceStatus.created && (
                        <Alert severity="success" sx={{ mb: 1 }}>
                            Instância criada com sucesso!
                        </Alert>
                    )}
                    {instanceStatus.webhook && (
                        <Alert severity="success" sx={{ mb: 1 }}>
                            Webhook configurado com sucesso!
                        </Alert>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default BotConfig;