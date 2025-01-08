import { Grid, Card, CardContent, Typography, Box, CircularProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { useEffect, useState } from 'react';
import { StaffBotService } from '../../../services/botConfig';

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
            const data = await StaffBotService.getMetrics();
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

            <Grid item xs={12} md={6} lg={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Leads Novos (24h)
                        </Typography>
                        <Typography variant="h4">
                            {metrics?.new_leads || 0}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
                <Card>
                    <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                            Clientes Existentes (24h)
                        </Typography>
                        <Typography variant="h4">
                            {metrics?.existing_clients || 0}
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

            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Últimas Interações
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Data/Hora</TableCell>
                                        <TableCell>Número</TableCell>
                                        <TableCell>Tipo</TableCell>
                                        <TableCell>Mensagem</TableCell>
                                        <TableCell>Resposta</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {metrics?.interactions?.map((interaction: any) => (
                                        <TableRow key={interaction.id}>
                                            <TableCell>
                                                {new Date(interaction.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell>{interaction.numero_whatsapp}</TableCell>
                                            <TableCell>
                                                {interaction.is_lead ? 'Lead' : 'Cliente'}
                                            </TableCell>
                                            <TableCell>{interaction.mensagem}</TableCell>
                                            <TableCell>{interaction.resposta}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default BotMetrics; 