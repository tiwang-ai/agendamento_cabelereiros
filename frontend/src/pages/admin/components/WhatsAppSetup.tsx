import WhatsAppConnection from '../../settings/WhatsAppConnection';
import { Box, Typography, Alert, TextField, Button } from '@mui/material';
import { useState } from 'react';
import { BotConfigService } from '../../../services/botConfig';

interface WhatsAppSetupProps {
    isSupport?: boolean;
}

const WhatsAppSetup = ({ isSupport = false }: WhatsAppSetupProps) => {
    const [phone, setPhone] = useState('');
    const [saved, setSaved] = useState(false);

    const handleSavePhone = async () => {
        try {
            await BotConfigService.saveConfig({ support_whatsapp: phone });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Erro ao salvar número:', error);
        }
    };

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
                />
                <Button
                    variant="contained"
                    onClick={handleSavePhone}
                >
                    Salvar Número
                </Button>
            </Box>
            
            <WhatsAppConnection 
                isSupport={isSupport}
                title="Bot de Suporte"
            />
        </Box>
    );
};

export default WhatsAppSetup; 