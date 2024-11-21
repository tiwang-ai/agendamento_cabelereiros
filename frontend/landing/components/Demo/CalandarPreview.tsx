// frontend/landing/components/Demo/CalendarView.tsx
import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { motion } from 'framer-motion';

interface CalendarViewProps {
  availableSlots: Array<{
    date: string;
    time: string;
  }>;
  onSelectSlot: (slot: { date: string; time: string }) => void;
}

const CalendarView = ({ availableSlots, onSelectSlot }: CalendarViewProps) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Horários Disponíveis
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {availableSlots.map((slot, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outlined"
              onClick={() => onSelectSlot(slot)}
              sx={{
                p: 2,
                width: '100%',
                justifyContent: 'space-between',
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  bgcolor: 'primary.light',
                  color: 'white'
                }
              }}
            >
              <Box>
                <Typography>
                  {format(new Date(slot.date), 'EEEE', { locale: ptBR })}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(slot.date), 'dd/MM/yyyy')}
                </Typography>
              </Box>
              <Typography variant="h6" color="primary">
                {slot.time}
              </Typography>
            </Button>
          </motion.div>
        ))}
      </Box>
    </Paper>
  );
};

export default CalendarView;