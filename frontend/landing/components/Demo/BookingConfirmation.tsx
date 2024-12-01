// frontend/landing/components/Demo/BookingConfirmation.tsx
import { Check as CheckIcon } from '@mui/icons-material';
import { Box, Paper, Typography, Divider, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

interface BookingConfirmationProps {
  slot: {
    date: string;
    time: string;
  };
  professional: {
    name: string;
    avatar: string;
  };
  service: string;
}

const BookingConfirmation = ({ slot, professional, service }: BookingConfirmationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <Paper sx={{ 
        p: 3,
        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Box sx={{ 
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }} />
        </motion.div>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckIcon sx={{ fontSize: 60, mb: 1 }} />
            </motion.div>
            <Typography variant="h5" gutterBottom>
              Agendamento Confirmado!
            </Typography>
          </Box>

          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              Serviço
            </Typography>
            <Typography variant="h6">
              {service}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              Data e Horário
            </Typography>
            <Typography variant="h6">
              {new Date(slot.date).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
              {' '}às {slot.time}
            </Typography>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              Profissional
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={professional.avatar} />
              <Typography variant="h6">
                {professional.name}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default BookingConfirmation;