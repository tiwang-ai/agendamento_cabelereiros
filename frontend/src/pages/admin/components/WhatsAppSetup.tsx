import WhatsAppConnection from '../components/WhatsAppConnection';
import { Box, Typography, Alert, TextField, Button, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { StaffBotService } from '../../../services/botConfig';
import { WhatsAppService } from '../../../services/whatsapp';

interface WhatsAppSetupProps {
    isSupport?: boolean;
}

const WhatsAppSetup = ({ isSupport = false }: WhatsAppSetupProps) => {
    const [phone, setPhone] = useState('');
    const [saved, setSaved] = useState(false);
    const [hasInstance, setHasInstance] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

    const handleGeneratePairingCode = async () => {
        try {
            const qrData = await StaffBotService.generateQRCode();
            if (qrData.error) {
                throw new Error(qrData.error);
            }
            return qrData;
        } catch (error) {
            console.error('Erro ao gerar código:', error);
            setError('Erro ao gerar código de pareamento');
        }
    };

    useEffect(() => {
        const initializeBot = async () => {
            try {
                // 1. Verifica existência da instância
                const instanceData = await StaffBotService.checkExistingInstance();
                
                if (instanceData.exists) {
                    setHasInstance(true);
                    // 2. Se existe, verifica status
                    const statusData = await StaffBotService.getStatus();
                    setStatus(statusData.status === 'open' ? 'connected' : 'disconnected');
                    
                    // 3. Se desconectado, gera QR code
                    if (statusData.status !== 'open') {
                        await handleGeneratePairingCode();
                    }
                } else {
                    // 4. Se não existe, cria instância
                    await createSupportInstance();
                }
            } catch (error) {
                console.error('Erro na inicialização:', error);
                setError('Erro ao inicializar bot de suporte');
            } finally {
                setLoading(false);
            }
        };

        initializeBot();
    }, []);

    const checkExistingConfig = async () => {
        try {
            const config = await StaffBotService.getConfig();
            if (config.support_whatsapp) {
                setPhone(config.support_whatsapp);
                setHasInstance(true);
            }
        } catch (error) {
            console.error('Erro ao verificar configuração:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePhone = async () => {
        try {
            setError(null);
            const configData = {
                support_whatsapp: phone,
                bot_ativo: true,
                evolution_settings: {
                    reject_calls: true,
                    read_messages: true,
                    groups_ignore: true
                }
            };
            
            await StaffBotService.saveConfig(configData);
            setSaved(true);
            setHasInstance(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Erro ao salvar número:', error);
            setError('Erro ao salvar número. Verifique o formato e tente novamente.');
        }
    };

    const createSupportInstance = async () => {
        try {
            const webhookUrl = `${import.meta.env.VITE_NGROK_URL}/api/admin/bot/webhook/`;
            
            const response = await WhatsAppService.createInstance({
                instanceName: 'support_bot',
                webhookUrl,
                isSupport: true
            });

            if (response.success) {
                setStatus('disconnected');
                setHasInstance(true);
                await handleGeneratePairingCode();
            }
        } catch (error) {
            console.error('Erro ao criar instância:', error);
            setError('Erro ao criar instância do bot de suporte');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
                Configure o WhatsApp do bot de suporte para atendimento aos salões
            </Alert>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    required
                    label="Número WhatsApp"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    helperText="Formato: 5511999999999"
                    sx={{ mb: 2 }}
                    error={!!error}
                />
                <Button
                    variant="contained"
                    onClick={handleSavePhone}
                    disabled={!phone}
                >
                    {hasInstance ? 'Alterar Número' : 'Salvar Número'}
                </Button>
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
                {saved && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Número salvo com sucesso!
                    </Alert>
                )}
            </Box>
            
            {hasInstance && (
                <WhatsAppConnection 
                    isSupport={true}
                    title="Bot de Suporte"
                />
            )}
        </Box>
    );
};

export default WhatsAppSetup; 