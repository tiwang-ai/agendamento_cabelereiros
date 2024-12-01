// frontend/landing/components/Demo/ProfessionalsView.tsx
import { Grid, Card, CardContent, Avatar, Typography, Box, Rating } from '@mui/material';
import { motion } from 'framer-motion';
import React from 'react';

interface Professional {
  id: number;
  name: string;
  avatar: string;
  rating: number;
}

interface ProfessionalsViewProps {
  professionals: Professional[];
  onSelectProfessional: (professional: Professional) => void;
}

const ProfessionalsView = ({ professionals, onSelectProfessional }: ProfessionalsViewProps) => {
  return (
    <Grid container spacing={2}>
      {professionals.map((prof, index) => (
        <Grid item xs={6} key={prof.id}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            <Card
              onClick={() => onSelectProfessional(prof)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) => theme.shadows[8]
                }
              }}
            >
              <CardContent>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar
                    src={prof.avatar}
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      mx: 'auto',
                      mb: 2,
                      border: '4px solid',
                      borderColor: 'primary.main'
                    }}
                  />
                </motion.div>
                <Typography variant="h6" align="center" gutterBottom>
                  {prof.name}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: 0.5 
                }}>
                  <Rating value={prof.rating} readOnly precision={0.1} />
                  <Typography variant="body2">
                    ({prof.rating})
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProfessionalsView;