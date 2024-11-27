// frontend/src/pages/settings/ChatManagement.tsx
import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Box,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { WhatsAppService } from '../../services/whatsapp';

interface ChatConfig {
  id: number;
  numero_cliente: string;
  bot_ativo: boolean;
  ultima_mensagem?: string;
  ultima_atualizacao: string;
}

const ChatManagement = () => {
  const [chats, setChats] = useState<ChatConfig[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await WhatsAppService.getChats();
      setChats(data);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBotToggle = async (chatId: number, newStatus: boolean) => {
    try {
      await WhatsAppService.toggleBot(chatId, newStatus);
      await loadChats();
    } catch (error) {
      console.error('Erro ao atualizar status do bot:', error);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.numero_cliente.includes(search)
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Gerenciamento de Conversas
        </Typography>

        <TextField
          fullWidth
          placeholder="Buscar por número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Última Mensagem</TableCell>
                  <TableCell>Última Atualização</TableCell>
                  <TableCell>Bot Ativo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredChats.map((chat) => (
                  <TableRow key={chat.id}>
                    <TableCell>{chat.numero_cliente}</TableCell>
                    <TableCell>{chat.ultima_mensagem || '-'}</TableCell>
                    <TableCell>
                      {new Date(chat.ultima_atualizacao).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={chat.bot_ativo}
                        onChange={(e) => handleBotToggle(chat.id, e.target.checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default ChatManagement;