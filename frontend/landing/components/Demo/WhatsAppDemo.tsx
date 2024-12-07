// frontend/landing/components/Demo/WhatsAppDemo.tsx
import { Send as SendIcon, Check as CheckIcon } from '@mui/icons-material';
import { Box, Paper, Typography, TextField, IconButton, Button, Grid, Card, CardContent, Avatar, Rating } from '@mui/material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { useState, ChangeEvent, KeyboardEvent , FC, ReactElement } from 'react';

import BookingConfirmation from './BookingConfirmation';

interface Message {
  type: 'bot' | 'user';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface Slot {
  date: string;
  time: string;
}

interface Professional {
  id: number;
  name: string;
  avatar: string;
  rating: number;
}

interface CalendarViewProps {
  availableSlots: Slot[];
  onSelectSlot: (slot: Slot) => void;
}

interface ProfessionalsViewProps {
  professionals: Professional[];
  onSelectProfessional: (professional: Professional) => void;
}

// Componente Motion personalizado
const MotionBox = motion.div;

const WhatsAppDemo: FC = (): ReactElement => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      type: 'bot', 
      text: 'Olá! Sou o assistente virtual do Salão Beauty Hair. Como posso ajudar?',
      time: format(new Date(), 'HH:mm')
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Novos estados para controlar elementos visuais
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProfessionals, setShowProfessionals] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);

  const processUserMessage = (message: string) => {
    const keywords = message.toLowerCase();
    
    if (keywords.includes('agendar') || keywords.includes('marcar') || keywords.includes('horário')) {
      return {
        response: 'Claro! Temos horários disponíveis para terça às 15h e quarta às 13h. Qual você prefere?',
        action: () => setShowCalendar(true)
      };
    }
    
    if (keywords.includes('terça') || keywords.includes('quarta') || keywords.includes('hora')) {
      return {
        response: 'Ótimo! Temos dois profissionais especializados disponíveis. Gostaria de conhecê-los?',
        action: () => {
          setShowCalendar(false);
          setShowProfessionals(true);
        }
      };
    }
    
    if (keywords.includes('júlio') || keywords.includes('carlos')) {
      return {
        response: 'Perfeito! Vou confirmar seu agendamento.',
        action: () => {
          setShowProfessionals(false);
          setShowConfirmation(true);
        }
      };
    }

    return {
      response: 'Como posso ajudar com seu agendamento hoje?',
      action: () => null
    };
  };

  const simulateResponse = async (userMessage: string) => {
    // Adiciona mensagem do usuário
    const newMessage: Message = {
      type: 'user',
      text: userMessage,
      time: format(new Date(), 'HH:mm'),
      status: 'sent'
    };
    
    setMessages(prev => [...prev, newMessage]);

    // Processa a mensagem e obtém resposta
    const { response, action } = processUserMessage(userMessage);

    // Simula delay de digitação
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Adiciona resposta do bot
    setMessages(prev => [...prev, {
      type: 'bot',
      text: response,
      time: format(new Date(), 'HH:mm')
    }]);

    // Executa ação visual
    action();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      simulateResponse(userInput);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setUserInput(`Quero agendar para ${format(new Date(slot.date), 'EEEE', { locale: ptBR })} às ${slot.time}`);
  };

  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
    setUserInput(`Quero agendar com ${professional.name}`);
  };

  return (
    <Box sx={{ display: 'flex', gap: 4, position: 'relative' }}>
      {/* WhatsApp Chat */}
      <Paper
        sx={{
          width: '100%',
          maxWidth: 360,
          height: 640,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3,
          position: 'relative'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#075E54',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Box
            component="img"
            src="/whatsapp-avatar.png"
            sx={{ width: 40, height: 40, borderRadius: '50%' }}
          />
          <Typography variant="subtitle1">Beauty Hair</Typography>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            bgcolor: '#E5DDD5',
            backgroundImage: 'url(/whatsapp-bg.png)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%'
              }}
            >
              <Paper
                sx={{
                  p: 1,
                  px: 2,
                  bgcolor: msg.type === 'user' ? '#DCF8C6' : 'white',
                  borderRadius: 2
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {msg.time}
                  </Typography>
                  {msg.type === 'user' && msg.status === 'read' && (
                    <CheckIcon sx={{ fontSize: 12, color: '#34B7F1' }} />
                  )}
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Input */}
        <Box sx={{ p: 1, bgcolor: '#F0F0F0', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Digite uma mensagem"
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{ bgcolor: 'white', borderRadius: 1 }}
          />
          <IconButton 
            color="primary"
            onClick={() => simulateResponse(userInput)}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Elementos Visuais Dinâmicos */}
      <Box sx={{ width: '400px' }}>
        <Box component={LazyMotion} features={domAnimation}>
          <Box component={AnimatePresence} mode="wait">
            {showCalendar && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <CalendarView 
                  availableSlots={[
                    { date: '2024-03-19', time: '15:00' },
                    { date: '2024-03-20', time: '13:00' }
                  ]}
                  onSelectSlot={handleSlotSelect}
                />
              </Box>
            )}

            {showProfessionals && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <ProfessionalsView
                  professionals={[
                    { id: 1, name: 'Júlio', avatar: '/julio.jpg', rating: 4.8 },
                    { id: 2, name: 'Carlos', avatar: '/carlos.jpg', rating: 4.9 }
                  ]}
                  onSelectProfessional={handleProfessionalSelect}
                />
              </Box>
            )}

            {showConfirmation && (
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <BookingConfirmation
                  slot={selectedSlot}
                  professional={selectedProfessional}
                  service="Corte Masculino"
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Componentes auxiliares
const CalendarView = ({ availableSlots, onSelectSlot }: CalendarViewProps) => {
  return (
    <Paper sx={{ p: 2, mb: 2, animation: 'fadeIn 0.3s ease-out' }}>
      <Typography variant="h6" gutterBottom>
        Horários Disponíveis
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {availableSlots.map((slot, index) => (
          <Button
            key={index}
            variant="outlined"
            onClick={() => onSelectSlot(slot)}
            sx={{
              p: 2,
              justifyContent: 'space-between',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'white'
              }
            }}
          >
            <Typography>
              {format(new Date(slot.date), 'EEEE', { locale: ptBR })}
            </Typography>
            <Typography>{slot.time}</Typography>
          </Button>
        ))}
      </Box>
    </Paper>
  );
};

const ProfessionalsView = ({ professionals, onSelectProfessional }: ProfessionalsViewProps) => {
  return (
    <Paper sx={{ p: 2, mb: 2, animation: 'fadeIn 0.3s ease-out' }}>
      <Typography variant="h6" gutterBottom>
        Profissionais Disponíveis
      </Typography>
      <Grid container spacing={2}>
        {professionals.map((prof) => (
          <Grid item xs={6} key={prof.id}>
            <Card
              onClick={() => onSelectProfessional(prof)}
              sx={{
                cursor: 'pointer',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent>
                <Avatar
                  src={prof.avatar}
                  sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}
                />
                <Typography variant="h6" align="center">
                  {prof.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                  <Rating value={prof.rating} readOnly precision={0.1} />
                  <Typography variant="body2">
                    ({prof.rating})
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default WhatsAppDemo;