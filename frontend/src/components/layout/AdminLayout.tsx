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
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Array de itens de navegação da sidebar
 * Cada item contém:
 * - name: Nome exibido no menu
 * - path: Caminho da rota
 * - icon: Path do SVG do ícone
 */
const navigationItems = [
  { 
    name: 'Dashboard', 
    path: '/admin/dashboard', 
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
  },
  { name: 'Salões', path: '/admin/salons', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { name: 'Planos', path: '/admin/plans', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Relatórios', path: '/admin/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { name: 'Suporte', path: '/admin/support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Barra lateral de navegação */}
      <div className="w-64 bg-white shadow-md">
        {/* Cabeçalho da Sidebar */}
        <div className="flex items-center justify-center h-16 border-b">
          <h1 className="text-xl font-bold text-primary-600">Admin Panel</h1>
        </div>

        {/* Menu de Navegação */}
        <nav className="mt-6">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.path} className="px-4 py-2">
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 ${
                    location.pathname === item.path
                      ? 'text-primary-600 font-medium'
                      : 'text-gray-600 hover:text-primary-600'
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
              </li>
            ))}
          </ul>
        </nav>

        {/* Botão de Logout */}
        <div className="absolute bottom-0 w-64 border-t p-4">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        {/* Cabeçalho da Página */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold text-gray-900">
              {navigationItems.find((item) => item.path === location.pathname)?.name || 'Admin'}
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