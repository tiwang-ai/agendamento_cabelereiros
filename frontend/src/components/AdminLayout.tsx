// src/components/AdminLayout.tsx
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AdminNavbar />
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: '240px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;