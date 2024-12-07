// src/components/AdminSidebar.tsx
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
  ViewList as PlansIcon,
  Support as SupportIcon,
  WhatsApp as WhatsAppIcon,
  Assessment as AssessmentIcon,
  Group as StaffIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Salões', icon: <BusinessIcon />, path: '/admin/salons' },
  { text: 'Usuários', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Planos', icon: <PlansIcon />, path: '/admin/plans' },
  { text: 'Financeiro', icon: <MoneyIcon />, path: '/admin/finance' },
  { text: 'Suporte Técnico', icon: <SupportIcon />, path: '/admin/tech-support' },
  { text: 'Status WhatsApp', icon: <WhatsAppIcon />, path: '/admin/whatsapp-status' },
  { text: 'Relatórios', icon: <AssessmentIcon />, path: '/admin/reports' },
  { text: 'Equipe Staff', icon: <StaffIcon />, path: '/admin/staff' },
  { text: 'Bot de Suporte', icon: <ChatIcon />, path: '/admin/bot-config' },
  // { text: 'Configurações', icon: <SettingsIcon />, path: '/admin/settings' }

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