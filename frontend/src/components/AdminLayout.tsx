import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  PhoneIcon,
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAdminAuth } from '@/contexts/auth/AdminAuthContext';
import api from '@/lib/axios';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Salões', href: '/admin/salons', icon: BuildingOfficeIcon },
  { name: 'Planos', href: '/admin/plans', icon: CurrencyDollarIcon },
  { name: 'Suporte Técnico', href: '/admin/support', icon: WrenchScrewdriverIcon },
  { name: 'Usuários', href: '/admin/users', icon: UsersIcon },
  { name: 'Financeiro', href: '/admin/financial', icon: CurrencyDollarIcon },
  { name: 'Status WhatsApp', href: '/admin/whatsapp-status', icon: PhoneIcon },
  { name: 'Relatórios', href: '/admin/reports', icon: ChartBarIcon },
  { name: 'Equipe Staff', href: '/admin/staff', icon: UserGroupIcon },
  { name: 'Bot de Suporte', href: '/admin/support-bot', icon: ChatBubbleLeftRightIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, signOutAdmin } = useAdminAuth();

  useEffect(() => {
    // Verificar se o usuário está autenticado como admin
    if (!adminUser) {
      navigate('/login', { replace: true });
    }
  }, [adminUser, navigate]);

  const handleLogout = async () => {
    await signOutAdmin();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg fixed h-full">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 px-4 bg-primary-700">
              <span className="text-xl font-bold text-white">Admin Panel</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-primary-600' : 'text-gray-400'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64">
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}