import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    whatsapp: true
  });
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('pt-BR');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {/* Notificações */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">Notificações</h3>
              <p className="mt-1 text-sm text-gray-500">
                Escolha como deseja receber as notificações do sistema.
              </p>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    id="email"
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="email" className="ml-3 text-sm text-gray-700">
                    Notificações por email
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="push"
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="push" className="ml-3 text-sm text-gray-700">
                    Notificações push no navegador
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="whatsapp"
                    type="checkbox"
                    checked={notifications.whatsapp}
                    onChange={(e) => setNotifications({ ...notifications, whatsapp: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="whatsapp" className="ml-3 text-sm text-gray-700">
                    Notificações por WhatsApp
                  </label>
                </div>
              </div>
            </div>

            {/* Tema */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">Tema</h3>
              <p className="mt-1 text-sm text-gray-500">
                Escolha o tema da interface.
              </p>
              <div className="mt-4">
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                  <option value="system">Sistema</option>
                </select>
              </div>
            </div>

            {/* Idioma */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">Idioma</h3>
              <p className="mt-1 text-sm text-gray-500">
                Escolha o idioma da interface.
              </p>
              <div className="mt-4">
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Restaurar Padrões
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 