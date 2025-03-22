/**
 * Componente principal da aplicação
 * 
 * Este arquivo define a estrutura de roteamento e navegação da aplicação,
 * implementando proteção de rotas baseada em perfis de usuário.
 */
import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { PrivateRoute } from '@/components/common/PrivateRoute';
import Loading from '@/components/common/Loading';
import AdminLayout from '@/components/layout/AdminLayout';
import ClientLayout from '@/components/layout/ClientLayout';
import ProfessionalLayout from '@/components/layout/ProfessionalLayout';

// Importação de páginas da área administrativa
import AdminDashboard from './pages/admin/Dashboard';
import SalonsManagement from './pages/admin/SalonsManagement';
import SalonUsers from './pages/admin/SalonUsers';
import Plans from './pages/admin/Plans';
import Reports from './pages/admin/Reports';
import Support from './pages/admin/Support';
import AdminUsers from './pages/admin/users';
import BotSettings from './pages/admin/bot/settings';
import BotTemplates from './pages/admin/bot/templates';
import BotMonitoring from './pages/admin/bot/monitoring';

// Importação de páginas da área de salão (cliente)
import ClientDashboard from './pages/client/Dashboard';
import ClientAppointments from './pages/client/Appointments';
import ClientCalendar from './pages/client/Calendar';
import ClientServices from './pages/client/Services';
import ClientSettings from './pages/client/Settings';

// Importação de páginas de perfil e configurações
import AdminProfile from './pages/admin/Profile';
import AdminSettings from './pages/admin/Settings';

// Importação de páginas públicas
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

/**
 * Componente para depurar navegação
 * 
 * Registra no console cada mudança de rota, útil para desenvolvimento
 * e depuração. Não renderiza nada visualmente.
 */
function NavigationDebug() {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Navegação para:', location.pathname);
  }, [location]);
  
  return null;
}

/**
 * Componente para proteção de rotas administrativas
 * 
 * Verifica se o usuário está autenticado e se tem o perfil 'admin'.
 * Redireciona para login caso contrário.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados se autenticado
 */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Efeito para verificar autenticação e perfil sempre que mudar de rota
  useEffect(() => {
    if (!loading) {
      console.log('AdminRoute - verificando usuário:', user);
      if (!user) {
        // Usuário não está autenticado
        console.log('Redirecionando para login (sem usuário)');
        navigate('/login', { replace: true });
      } else if (user.role !== UserRole.ADMIN) {
        // Usuário não tem perfil admin
        console.log('Redirecionando para login (não é admin)');
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate, location]);
  
  // Mostra indicador de carregamento enquanto verifica autenticação
  if (loading) {
    return <Loading />;
  }
  
  // Renderiza os filhos apenas se o usuário for admin
  return user?.role === UserRole.ADMIN ? <>{children}</> : null;
}

/**
 * Componente para proteção de rotas de dono de salão
 * 
 * Verifica se o usuário está autenticado e se tem o perfil 'salon_owner'.
 * Redireciona para login caso contrário.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados se autenticado
 */
function SalonRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Efeito para verificar autenticação e perfil
  useEffect(() => {
    if (!loading) {
      console.log('SalonRoute - verificando usuário:', user);
      if (!user) {
        // Usuário não está autenticado
        console.log('Redirecionando para login (sem usuário)');
        navigate('/login', { replace: true });
      } else if (user.role !== UserRole.SALON_OWNER) {
        // Usuário não é dono de salão
        console.log('Redirecionando para login (não é salon_owner)');
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate, location]);
  
  if (loading) {
    return <Loading />;
  }
  
  return user?.role === UserRole.SALON_OWNER ? <>{children}</> : null;
}

/**
 * Componente para proteção de rotas genéricas (requer apenas autenticação)
 * 
 * Verifica se o usuário está autenticado, sem verificar perfil específico.
 * Redireciona para login caso não esteja autenticado.
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados se autenticado
 */
function ClientRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading) {
      console.log('ClientRoute - verificando usuário:', user);
      if (!user) {
        console.log('Redirecionando para login (sem usuário)');
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate, location]);
  
  if (loading) {
    return <Loading />;
  }
  
  return user ? <>{children}</> : null;
}

/**
 * Componente principal da aplicação
 * 
 * Define toda a estrutura de roteamento da aplicação, com:
 * - Rotas públicas (login, registro)
 * - Rotas administrativas (protegidas para admin)
 * - Rotas de salão (protegidas para salon_owner)
 * - Redirecionamentos padrão
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* Componente para depuração de navegação */}
      <NavigationDebug />
      
      {/* Suspense para carregamento lazy de componentes */}
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Rotas públicas - acessíveis a qualquer usuário */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas administrativas - acessíveis apenas a usuários admin */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute allowedRoles={[UserRole.SUPERUSER, UserRole.ADMIN]}>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="salons" element={<SalonsManagement />} />
                    <Route path="salon-users" element={<SalonUsers />} />
                    <Route path="plans" element={<Plans />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="support" element={<Support />} />
                    <Route path="profile" element={<AdminProfile />} />
                    <Route path="settings" element={<AdminSettings />} />
                    
                    {/* Rotas exclusivas para SUPERUSER */}
                    <Route
                      path="users/*"
                      element={
                        <PrivateRoute allowedRoles={[UserRole.SUPERUSER]}>
                          <AdminUsers />
                        </PrivateRoute>
                      }
                    />
                    
                    {/* Rotas do bot (apenas SUPERUSER) */}
                    <Route
                      path="bot/*"
                      element={
                        <PrivateRoute allowedRoles={[UserRole.SUPERUSER]}>
                          <Routes>
                            <Route path="settings" element={<BotSettings />} />
                            <Route path="templates" element={<BotTemplates />} />
                            <Route path="monitoring" element={<BotMonitoring />} />
                          </Routes>
                        </PrivateRoute>
                      }
                    />
                    
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </PrivateRoute>
            }
          />

          {/* Rotas de salão - acessíveis apenas a donos de salão */}
          <Route path="/salon" element={
            <PrivateRoute allowedRoles={[UserRole.SALON_OWNER]}>
              <ClientLayout>
                <Outlet />
              </ClientLayout>
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="appointments" element={<ClientAppointments />} />
            <Route path="calendar" element={<ClientCalendar />} />
            <Route path="services" element={<ClientServices />} />
            <Route path="settings" element={<ClientSettings />} />
          </Route>

          {/* Rotas de profissional */}
          <Route path="/professional" element={
            <PrivateRoute allowedRoles={[UserRole.PROFESSIONAL]}>
              <ProfessionalLayout>
                <Outlet />
              </ProfessionalLayout>
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<div>Professional Dashboard</div>} />
          </Route>

          {/* Rotas de recepcionista */}
          <Route path="/receptionist" element={
            <PrivateRoute allowedRoles={[UserRole.RECEPTIONIST]}>
              <ClientLayout>
                <Outlet />
              </ClientLayout>
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="appointments" element={<ClientAppointments />} />
            <Route path="calendar" element={<ClientCalendar />} />
            <Route path="clients" element={<ClientDashboard />} />
          </Route>

          {/* Redirecionamentos padrão */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}