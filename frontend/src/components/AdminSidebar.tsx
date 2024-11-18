// src/components/AdminSidebar.tsx
import { Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  ViewList as PlansIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Salões', icon: <BusinessIcon />, path: '/admin/salons' },
  { text: 'Usuários', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Planos', icon: <PlansIcon />, path: '/admin/plans' },
  { text: 'Financeiro', icon: <MoneyIcon />, path: '/admin/finance' },
  { text: 'Configurações', icon: <SettingsIcon />, path: '/admin/settings' }
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`,
          marginTop: '64px' // Altura da AppBar
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.main }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default AdminSidebar;