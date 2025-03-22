/**
 * Layout principal para a área administrativa
 * 
 * Este componente fornece a estrutura básica para todas as páginas administrativas,
 * incluindo a barra lateral de navegação (sidebar) e o container principal.
 * 
 * Características:
 * - Sidebar fixa com navegação principal
 * - Cabeçalho com título da página atual
 * - Área de conteúdo principal com scroll independente
 * - Botão de logout no rodapé da sidebar
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Array de itens de navegação da sidebar
 * Cada item contém:
 * - name: Nome exibido no menu
 * - path: Caminho da rota
 * - icon: Path do SVG do ícone
 * - roles: Papéis que podem acessar este item
 */
const navigationItems = [
  { 
    name: 'Dashboard', 
    path: '/admin/dashboard', 
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    roles: [UserRole.SUPERUSER, UserRole.ADMIN]
  },
  { 
    name: 'Usuários', 
    path: '/admin/users', 
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    roles: [UserRole.SUPERUSER]
  },
  { 
    name: 'Salões', 
    path: '/admin/salons', 
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    roles: [UserRole.SUPERUSER, UserRole.ADMIN]
  },
  { 
    name: 'Planos', 
    path: '/admin/plans', 
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    roles: [UserRole.SUPERUSER, UserRole.ADMIN]
  },
  { 
    name: 'Bot', 
    path: '/admin/bot',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
    roles: [UserRole.SUPERUSER],
    submenu: [
      {
        name: 'Configurações',
        path: '/admin/bot/settings',
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
      },
      {
        name: 'Templates',
        path: '/admin/bot/templates',
        icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
      },
      {
        name: 'Monitoramento',
        path: '/admin/bot/monitoring',
        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
      }
    ]
  },
  { 
    name: 'Relatórios', 
    path: '/admin/reports', 
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    roles: [UserRole.SUPERUSER, UserRole.ADMIN]
  },
  { 
    name: 'Suporte', 
    path: '/admin/support', 
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    roles: [UserRole.SUPERUSER, UserRole.ADMIN]
  },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  /**
   * Manipula o logout do usuário
   * Chama a função de logout do contexto de autenticação e trata possíveis erros
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Filtra os itens de navegação baseado no papel do usuário
  const filteredNavigationItems = navigationItems.filter(
    item => user && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Barra lateral de navegação */}
      <div className="w-64 bg-white shadow-md">
        {/* Cabeçalho da Sidebar */}
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold text-primary-600">Painel Admin</h1>
        </div>

        {/* Menu de Navegação */}
        <nav className="mt-6">
          <ul>
            {filteredNavigationItems.map((item) => (
              <li key={item.path} className="px-4">
                {'submenu' in item ? (
                  <div>
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.path ? null : item.path)}
                      className={`w-full flex items-center justify-between py-2 ${
                        location.pathname.startsWith(item.path)
                          ? 'text-primary-600 font-medium'
                          : 'text-gray-600 hover:text-primary-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={item.icon}
                          />
                        </svg>
                        <span>{item.name}</span>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transform transition-transform ${
                          expandedItem === item.path ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {expandedItem === item.path && item.submenu && (
                      <ul className="ml-6 space-y-2 mt-2">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.path}>
                            <Link
                              to={subItem.path}
                              className={`flex items-center space-x-2 py-2 ${
                                location.pathname === subItem.path
                                  ? 'text-primary-600 font-medium'
                                  : 'text-gray-600 hover:text-primary-700'
                              }`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d={subItem.icon}
                                />
                              </svg>
                              <span className="text-sm">{subItem.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 py-2 ${
                      location.pathname === item.path
                        ? 'text-primary-600 font-medium'
                        : 'text-gray-600 hover:text-primary-700'
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Perfil e Logout */}
        <div className="absolute bottom-0 w-64 border-t">
          {/* Perfil do Usuário */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full p-4 flex items-center hover:bg-gray-50"
            >
              <div className="flex-shrink-0 h-8 w-8">
                {user?.avatar_url ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.avatar_url}
                    alt={`Avatar de ${user.name}`}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-gray-400 transform transition-transform ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Menu Dropdown do Perfil */}
            {showProfileMenu && (
              <div className="absolute bottom-full left-0 w-full bg-white border-t border-gray-200 shadow-lg">
                <Link
                  to="/admin/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Meu Perfil
                </Link>
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Configurações
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        {/* Cabeçalho da Página */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-gray-900">
              {filteredNavigationItems.find((item) => 
                'submenu' in item 
                  ? item.submenu?.some(sub => sub.path === location.pathname)
                  : item.path === location.pathname
              )?.name || 'Admin'}
            </h1>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 