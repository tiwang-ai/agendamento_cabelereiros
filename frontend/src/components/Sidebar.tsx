// src/components/Sidebar.tsx
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as CalendarIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ListAlt as ListAltIcon,
  Money as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', show: true },
    { text: 'Calendário', icon: <CalendarIcon />, path: '/calendar', show: permissions.canViewCalendar },
    { text: 'Profissionais', icon: <PeopleIcon />, path: '/professionals', show: permissions.canManageProfessionals },
    { text: 'Serviços', icon: <ListAltIcon />, path: '/services', show: permissions.canManageServices },
    { text: 'Financeiro', icon: <MoneyIcon />, path: '/financials', show: permissions.canViewFinancials },
    { text: 'Configurações', icon: <SettingsIcon />, path: '/settings', show: true }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px' // Altura da AppBar
        },
      }}
    >
      <List>
        {menuItems
          .filter(item => item.show)
          .map((item) => (
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