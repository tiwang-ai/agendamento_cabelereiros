import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRightOnRectangleIcon, UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

const getNavigationByRole = (role: UserRole) => {
  switch (role) {
    case UserRole.SUPERUSER:
      return [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Salões', href: '/admin/salons' },
        { name: 'Usuários', href: '/admin/users' },
        { 
          name: 'Bot',
          href: '/admin/bot',
          subItems: [
            { name: 'Monitoramento', href: '/admin/bot/monitoring' },
            { name: 'Templates', href: '/admin/bot/templates' },
            { name: 'Configurações', href: '/admin/bot/settings' },
          ]
        },
        { name: 'Planos', href: '/admin/plans' },
        { name: 'Relatórios', href: '/admin/reports' },
        { name: 'Suporte', href: '/admin/support' },
      ];
    case UserRole.ADMIN:
      return [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Salões', href: '/admin/salons' },
        { name: 'Planos', href: '/admin/plans' },
        { name: 'Relatórios', href: '/admin/reports' },
        { name: 'Suporte', href: '/admin/support' },
      ];
    case UserRole.SALON_OWNER:
      return [
        { name: 'Dashboard', href: '/salon/dashboard' },
        { name: 'Agendamentos', href: '/salon/appointments' },
        { name: 'Calendário', href: '/salon/calendar' },
        { name: 'Clientes', href: '/salon/clients' },
        { name: 'Assistente IA', href: '/salon/assistant' },
        { 
          name: 'Dados',
          href: '/salon/data',
          subItems: [
            { name: 'Serviços', href: '/salon/data/services' },
            { name: 'Profissionais', href: '/salon/data/professionals' },
            { name: 'Salão', href: '/salon/data/salon' },
          ]
        },
        { name: 'WhatsApp', href: '/salon/settings/whatsapp' },
      ];
    case UserRole.PROFESSIONAL:
      return [
        { name: 'Dashboard', href: '/professional/dashboard' },
        { name: 'Minha Agenda', href: '/professional/appointments' },
        { name: 'Calendário', href: '/professional/calendar' },
        { name: 'Meus Clientes', href: '/professional/clients' },
      ];
    case UserRole.RECEPTIONIST:
      return [
        { name: 'Dashboard', href: '/receptionist/dashboard' },
        { name: 'Agendamentos', href: '/receptionist/appointments' },
        { name: 'Calendário', href: '/receptionist/calendar' },
        { name: 'Clientes', href: '/receptionist/clients' },
      ];
    default:
      return [];
  }
};

export default function Navbar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const roleNavigation = user ? getNavigationByRole(user.role) : [];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600">Beauty Salon</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {roleNavigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.href}
                    className={`${
                      location.pathname === item.href || 
                      (item.subItems && item.subItems.some(sub => location.pathname === sub.href))
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}
                  >
                    {item.name}
                  </Link>
                  
                  {item.subItems && (
                    <div className="absolute hidden group-hover:block w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          to={subItem.href}
                          className={`${
                            location.pathname === subItem.href
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700'
                          } block px-4 py-2 text-sm hover:bg-gray-50`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium">{user?.name}</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/admin/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserCircleIcon className="h-5 w-5 inline-block mr-2" />
                    Meu Perfil
                  </Link>
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Cog6ToothIcon className="h-5 w-5 inline-block mr-2" />
                    Configurações
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 inline-block mr-2" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}