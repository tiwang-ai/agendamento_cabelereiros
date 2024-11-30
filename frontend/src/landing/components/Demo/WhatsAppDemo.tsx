import { useState, ChangeEvent, KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// ... outros imports ...

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

const WhatsAppDemo = () => {
  // ... estados ...

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
    // ... resto do código ...
    <TextField
      fullWidth
      placeholder="Digite uma mensagem"
      value={userInput}
      onChange={handleInputChange}
      onKeyPress={handleKeyPress}
      size="small"
      sx={{ bgcolor: 'white', borderRadius: 1 }}
    />

    <Box sx={{ width: '400px' }}>
      <AnimatePresence mode="wait">
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            component="div"
          >
            <CalendarView 
              availableSlots={[
                { date: '2024-03-19', time: '15:00' },
                { date: '2024-03-20', time: '13:00' }
              ]}
              onSelectSlot={handleSlotSelect}
            />
          </motion.div>
        )}

        {/* Similar para os outros motion.div */}
      </AnimatePresence>
    </Box>
  );
}; 