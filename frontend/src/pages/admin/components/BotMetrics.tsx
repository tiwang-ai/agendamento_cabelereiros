import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { BotConfigService } from '../../../services/botConfig';

const BotMetrics = () => {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMetrics();
        const interval = setInterval(loadMetrics, 30000); // Atualiza a cada 30s
        return () => clearInterval(interval);
    }, []);

    const loadMetrics = async () => {
        try {
            const data = await BotConfigService.getMetrics();
            setMetrics(data);
        } catch (error) {
            console.error('Erro ao carregar métricas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Atendimentos Hoje
                        </Typography>
                        <Typography variant="h4">
                            {metrics?.today_interactions || 0}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Tempo Médio de Resposta
                        </Typography>
                        <Typography variant="h4">
                            {metrics?.avg_response_time || '0s'}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Taxa de Resolução
                        </Typography>
                        <Typography variant="h4">
                            {metrics?.resolution_rate || '0%'}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Interações IA
                        </Typography>
                        <Typography variant="h4">
                            {metrics?.ai_interactions || 0}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Histórico de Interações
                        </Typography>
                        {/* Aqui você pode adicionar um gráfico com histórico */}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default BotMetrics; 