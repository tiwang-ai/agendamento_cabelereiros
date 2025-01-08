// frontend/src/pages/admin/BotConfig.tsx
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Grid
} from '@mui/material';
import { useState, useEffect, ChangeEvent } from 'react';
import WhatsAppSetup from './components/WhatsAppSetup';
import BotMetrics from './components/BotMetrics';
import BotSettings from './components/BotSettings';
import { StaffBotService } from '../../services/botConfig';

const BotConfig = () => {
    const [tabValue, setTabValue] = useState(0);
    const [configLoaded, setConfigLoaded] = useState(false);

    useEffect(() => {
        checkInitialConfig();
    }, []);

    const checkInitialConfig = async () => {
        try {
            const config = await StaffBotService.getConfig();
            setConfigLoaded(!!config.support_whatsapp);
        } catch (error) {
            console.error('Erro ao verificar configuração inicial:', error);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        // Só permite mudar para outras abas se já tiver configuração básica
        if (newValue !== 1 && !configLoaded) {
            alert('Configure primeiro o WhatsApp do bot');
            return;
        }
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 3, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Configuração do Bot de Suporte
                </Typography>

                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Conexão WhatsApp" />
                    <Tab label="Configurações Gerais" />
                    <Tab label="Métricas" />
                </Tabs>

                {tabValue === 0 && (
                    <WhatsAppSetup isSupport={true} />
                )}

                {tabValue === 1 && configLoaded && (
                    <BotSettings />
                )}

                {tabValue === 2 && configLoaded && (
                    <BotMetrics />
                )}
            </Paper>
        </Container>
    );
};

export default BotConfig;