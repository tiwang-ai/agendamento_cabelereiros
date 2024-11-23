import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import SalonDashboard from './pages/dashboard/SalonDashboard'
import Calendar from './pages/calendar/Calendar'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import PricingPage from './pages/plans/PricingPage'
import OnboardingFlow from './pages/onboarding/OnboardingFlow'
import { AuthProvider } from './contexts/AuthContext'
import ProfessionalsManagement from './pages/management/Professionals'
import ServicesManagement from './pages/management/Services'
import { UserRole } from './types/auth'
import AdminDashboard from './pages/admin/Dashboard'
import AdminLayout from './components/AdminLayout'
import PlansManagement from './pages/admin/Plans'
import SalonsManagement from './pages/admin/Salons'
import SalonDetails from './pages/admin/SalonDetails'
import UsersManagement from './pages/admin/Users'
import Finance from './pages/admin/Finance'
import LandingPage from '../landing/pages/index'
import WhatsAppConnection from './pages/settings/WhatsAppConnection'
import TechSupport from './pages/admin/TechSupport'
import WhatsAppStatus from './pages/admin/WhatsAppStatus'

function App() {
  return (
    <AuthProvider>
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
          <Route element={<Layout />}>
            <Route path="/" element={<SalonDashboard />} />
            <Route path="/dashboard" element={<SalonDashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/professionals" element={<ProfessionalsManagement />} />
            <Route path="/services" element={<ServicesManagement />} />
            <Route path="/whatsapp-connection" element={<WhatsAppConnection />} />
            <Route path="/settings/whatsapp" element={<WhatsAppConnection />} />
          </Route>
        </Route>
        {/* Rotas Administrativas */}
        <Route element={<PrivateRoute roles={[UserRole.ADMIN]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/plans" element={<PlansManagement />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/salons" element={<SalonsManagement />} />
            <Route path="/admin/salons/:id" element={<SalonDetails />} />
            <Route path="/admin/finance" element={<Finance />} />
            <Route path="/admin/tech-support" element={<TechSupport />} />
            <Route path="/admin/whatsapp-status" element={<WhatsAppStatus />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
