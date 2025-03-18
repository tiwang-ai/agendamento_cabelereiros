import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AdminLayout from './components/AdminLayout';
import ClientLayout from './components/ClientLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEstablishments from './pages/admin/Establishments';
import SalonUsers from './pages/admin/SalonUsers';
import Plans from './pages/admin/Plans';
import Reports from './pages/admin/Reports';
import Support from './pages/admin/Support';
import ClientDashboard from './pages/client/Dashboard';
import ClientAppointments from './pages/client/Appointments';
import ClientCalendar from './pages/client/Calendar';
import ClientServices from './pages/client/Services';
import ClientSettings from './pages/client/Settings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/login" />;
}

function SalonRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return user?.role === 'salon_owner' ? <>{children}</> : <Navigate to="/login" />;
}

function ClientRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Carregando...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </AdminRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="establishments" element={<AdminEstablishments />} />
          <Route path="establishments/:salonId/users" element={<SalonUsers />} />
          <Route path="plans" element={<Plans />} />
          <Route path="reports" element={<Reports />} />
          <Route path="support" element={<Support />} />
        </Route>

        {/* Salon routes */}
        <Route path="/salon" element={
          <SalonRoute>
            <ClientLayout>
              <Outlet />
            </ClientLayout>
          </SalonRoute>
        }>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="appointments" element={<ClientAppointments />} />
          <Route path="calendar" element={<ClientCalendar />} />
          <Route path="services" element={<ClientServices />} />
          <Route path="settings" element={<ClientSettings />} />
        </Route>

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}