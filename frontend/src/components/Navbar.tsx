// src/components/Navbar.tsx
import { AppBar, Toolbar, Typography, IconButton, Button, Box } from '@mui/material';
import { Menu as MenuIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from './LanguageSelector';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          onClick={toggleSidebar}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Sistema de Agendamento
        </Typography>
        <Box sx={{ ml: 2 }}>
          <LanguageSelector />
        </Box>
        <Button color="inherit" onClick={() => navigate('/login')} startIcon={<LogoutIcon />}>
          Sair
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;