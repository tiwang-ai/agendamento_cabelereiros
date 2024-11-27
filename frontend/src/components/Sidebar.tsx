// src/components/Sidebar.tsx
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as CalendarIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ListAlt as ListAltIcon,
  WhatsApp as WhatsAppIcon,
  Person as ClientsIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

const drawerWidth = 240;

interface SidebarProps {
  open: boolean;
}

const Sidebar = ({ open }: SidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const ownerMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Calendário', icon: <CalendarIcon />, path: '/calendar' },
    { text: 'Profissionais', icon: <PeopleIcon />, path: '/professionals' },
    { text: 'Serviços', icon: <ListAltIcon />, path: '/services' },
    { text: 'Clientes', icon: <ClientsIcon />, path: '/clients' },
    { text: 'Gerenciar Conversas', icon: <ChatIcon />, path: '/settings/chats' },
    { text: 'Financeiro', icon: <MoneyIcon />, path: '/finance' },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/settings' }
  ];

  const professionalMenuItems = [
    { text: 'Agenda', icon: <CalendarIcon />, path: '/professional/agenda' },
    { text: 'Clientes', icon: <ClientsIcon />, path: '/professional/clients' },
    { text: 'Histórico', icon: <ListAltIcon />, path: '/professional/historico' },
    { text: 'Perfil', icon: <PersonIcon />, path: '/professional/profile' }
  ];

  const menuItems = user?.role === UserRole.PROFESSIONAL ? professionalMenuItems : ownerMenuItems;

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px',
          transform: open ? 'none' : 'translateX(-100%)',
          transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms'
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;