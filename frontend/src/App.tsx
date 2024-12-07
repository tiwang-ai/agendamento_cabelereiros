// frontend/src/App.tsx
import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import { I18nextProvider } from 'react-i18next';
import { Routes, Route, Outlet } from 'react-router-dom'

import LandingPage from '../landing/pages/index'

import AdminLayout from './components/AdminLayout'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import SalonDashboard from './pages/dashboard/SalonDashboard'
import Calendar from './pages/calendar/Calendar'
import OnboardingFlow from './pages/onboarding/OnboardingFlow'
import PricingPage from './pages/plans/PricingPage'
import { AuthProvider } from './contexts/AuthContext'
import ProfessionalsManagement from './pages/management/Professionals'
import ServicesManagement from './pages/management/Services'
import Agenda from './pages/professional/Agenda'
import WhatsAppConnection from './pages/settings/WhatsAppConnection'
import { UserRole } from './types/auth'
import AdminDashboard from './pages/admin/Dashboard'
import PlansManagement from './pages/admin/Plans'
import SalonsManagement from './pages/admin/Salons'
import SalonDetails from './pages/admin/SalonDetails'
import UsersManagement from './pages/admin/Users'
import Finance from './pages/admin/Finance'


import TechSupport from './pages/admin/TechSupport'
import WhatsAppStatus from './pages/admin/WhatsAppStatus'
import History from './pages/professional/History'
import Clients from './pages/management/Clients'
import ProfessionalClients from './pages/professional/Clients'
import Reports from './pages/admin/Reports'
import StaffManagement from './pages/admin/StaffManagement'
import ProfessionalProfile from './pages/professional/Profile'
import Settings from './pages/settings/Settings'
import AdminProfile from './pages/admin/Profile'
import i18n from './i18n';
import theme from './theme'
import ChatManagement from './pages/settings/ChatManagement';
import BotConfig from './pages/admin/BotConfig';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<OnboardingFlow />} />
              {/* Rotas do Salão */}
              <Route element={<PrivateRoute roles={[UserRole.OWNER]} />}>
                <Route element={<Layout>
                  <Outlet />
                </Layout>}>
                  <Route path="/dashboard" element={<SalonDashboard />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/professionals" element={<ProfessionalsManagement />} />
                  <Route path="/services" element={<ServicesManagement />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/settings/profile" element={<Settings />} />
                  <Route path="/settings/whatsapp" element={<WhatsAppConnection />} />
                  <Route path="/settings/chats" element={<ChatManagement />} />
                </Route>
              </Route>
              {/* Rotas Administrativas */}
              <Route element={<PrivateRoute roles={[UserRole.ADMIN]} />}>
                <Route element={<AdminLayout>
                  <Outlet />
                </AdminLayout>}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/plans" element={<PlansManagement />} />
                  <Route path="/admin/users" element={<UsersManagement />} />
                  <Route path="/admin/salons" element={<SalonsManagement />} />
                  <Route path="/admin/salons/:id" element={<SalonDetails />} />
                  <Route path="/admin/finance" element={<Finance />} />
                  <Route path="/admin/tech-support" element={<TechSupport />} />
                  <Route path="/admin/whatsapp-status" element={<WhatsAppStatus />} />
                  <Route path="/admin/reports" element={<Reports />} />
                  <Route path="/admin/staff" element={<StaffManagement />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                  <Route path="/admin/chats" element={<ChatManagement />} />
                  <Route path="/admin/bot-config" element={<BotConfig />} />
                </Route>
              </Route>
              {/* Rotas do Profissional */}
              <Route element={<PrivateRoute roles={[UserRole.PROFESSIONAL]} />}>
                <Route element={<Layout>
                  <Outlet />
                </Layout>}>
                  <Route path="/professional/agenda" element={<Agenda />} />
                  <Route path="/professional/historico" element={<History />} />
                  <Route path="/professional/clients" element={<ProfessionalClients />} />
                  <Route path="/professional/profile" element={<ProfessionalProfile />} />
                </Route>
              </Route>
              {/* Rota de Gerenciamento de Clientes */}
              <Route element={<PrivateRoute roles={[UserRole.OWNER, UserRole.PROFESSIONAL]} />}>
                <Route element={<Layout>
                  <Outlet />
                </Layout>}>
                  <Route path="/clients" element={<Clients />} />
                </Route>
              </Route>
            </Routes>
          </ThemeProvider>
        </LocalizationProvider>
      </AuthProvider>
    </I18nextProvider>
  )
}

export default App
