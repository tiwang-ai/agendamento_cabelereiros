import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BuildingOfficeIcon, UserGroupIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export default function Data() {
  const navigate = useNavigate();
  const location = useLocation();
  const showMenu = location.pathname === '/data';

  const menuItems = [
    {
      title: 'Serviços',
      description: 'Gerenciar serviços oferecidos',
      icon: WrenchScrewdriverIcon,
      path: '/data/services',
    },
    {
      title: 'Profissionais',
      description: 'Gerenciar equipe de profissionais',
      icon: UserGroupIcon,
      path: '/data/professionals',
    },
    {
      title: 'Estabelecimento',
      description: 'Configurações do estabelecimento',
      icon: BuildingOfficeIcon,
      path: '/data/establishment',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dados</h1>
      
      {showMenu ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-left"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <item.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}