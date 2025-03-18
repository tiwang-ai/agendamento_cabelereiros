import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Agendamentos', href: '/appointments' },
  { name: 'Calendário', href: '/calendar' },
  { name: 'Clientes', href: '/clients' },
  { name: 'Assistente IA', href: '/assistant' },
  { 
    name: 'Dados',
    href: '/data',
    subItems: [
      { name: 'Serviços', href: '/data/services' },
      { name: 'Profissionais', href: '/data/professionals' },
      { name: 'Estabelecimento', href: '/data/establishment' },
    ]
  },
  { name: 'WhatsApp', href: '/settings/whatsapp' },
];

export default function Navbar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600">Beauty Salon</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
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
          <div className="flex items-center">
            <button
              onClick={signOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}