import WhatsAppConnection from '../../settings/WhatsAppConnection';
import { Box, Typography, Alert, TextField, Button, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { StaffBotService } from '../../../services/botConfig';

interface WhatsAppSetupProps {
    isSupport?: boolean;
}

const WhatsAppSetup = ({ isSupport = false }: WhatsAppSetupProps) => {
    const [phone, setPhone] = useState('');
    const [saved, setSaved] = useState(false);
    const [hasInstance, setHasInstance] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkExistingConfig();
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
            
            console.log('Enviando configuração:', configData); // Debug
            
            await StaffBotService.saveConfig(configData);
            setSaved(true);
            setHasInstance(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Erro ao salvar número:', error);
            setError('Erro ao salvar número. Verifique o formato e tente novamente.');
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
                    isSupport={isSupport}
                    title="Bot de Suporte"
                />
            )}
        </Box>
    );
};

export default WhatsAppSetup; 