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

const BotConfig = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 3, mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Configuração do Bot de Suporte
                </Typography>

                <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Configurações Gerais" />
                    <Tab label="Conexão WhatsApp" />
                    <Tab label="Métricas" />
                </Tabs>

                {tabValue === 0 && (
                    <BotSettings />
                )}

                {tabValue === 1 && (
                    <WhatsAppSetup isSupport={true} />
                )}

                {tabValue === 2 && (
                    <BotMetrics />
                )}
            </Paper>
        </Container>
    );
};

export default BotConfig;