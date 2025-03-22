import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface BotSettings {
  api_url: string;
  api_key: string;
  default_language: string;
  default_model: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
}

export default function BotSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BotSettings>({
    api_url: '',
    api_key: '',
    default_language: 'pt-BR',
    default_model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    max_tokens: 2048,
    temperature: 0.7,
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // TODO: Implementar chamada real à API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay
        setSettings({
          api_url: 'https://api.deepinfra.com/v1/openai/chat/completions',
          api_key: '****************************************',
          default_language: 'pt-BR',
          default_model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          max_tokens: 2048,
          temperature: 0.7,
          is_active: true
        });
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        setError('Não foi possível carregar as configurações do bot.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleToggleActive = () => {
    setSettings(prev => ({
      ...prev,
      is_active: !prev.is_active
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // TODO: Implementar chamada real à API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay
      // Simula sucesso
      console.log('Configurações salvas:', settings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar as configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Bot</h1>
        <div className="flex items-center space-x-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            settings.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {settings.is_active ? 'Ativo' : 'Inativo'}
          </span>
          <button
            type="button"
            onClick={handleToggleActive}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              settings.is_active
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
          >
            {settings.is_active ? 'Desativar' : 'Ativar'} Bot
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
        <div className="p-6 space-y-6">
          {/* URL da API */}
          <div>
            <label htmlFor="api_url" className="block text-sm font-medium text-gray-700">
              URL da API
            </label>
            <input
              type="url"
              name="api_url"
              id="api_url"
              value={settings.api_url}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          {/* Chave da API */}
          <div>
            <label htmlFor="api_key" className="block text-sm font-medium text-gray-700">
              Chave da API
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type={showApiKey ? 'text' : 'password'}
                name="api_key"
                id="api_key"
                value={settings.api_key}
                onChange={handleChange}
                className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                {showApiKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {/* Idioma Padrão */}
          <div>
            <label htmlFor="default_language" className="block text-sm font-medium text-gray-700">
              Idioma Padrão
            </label>
            <select
              name="default_language"
              id="default_language"
              value={settings.default_language}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          {/* Modelo */}
          <div>
            <label htmlFor="default_model" className="block text-sm font-medium text-gray-700">
              Modelo
            </label>
            <select
              name="default_model"
              id="default_model"
              value={settings.default_model}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="mistralai/Mixtral-8x7B-Instruct-v0.1">Mixtral 8x7B</option>
              <option value="meta-llama/Llama-2-70b-chat-hf">Llama 2 70B</option>
            </select>
          </div>

          {/* Tokens Máximos */}
          <div>
            <label htmlFor="max_tokens" className="block text-sm font-medium text-gray-700">
              Tokens Máximos
            </label>
            <input
              type="number"
              name="max_tokens"
              id="max_tokens"
              value={settings.max_tokens}
              onChange={handleChange}
              min="1"
              max="4096"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* Temperatura */}
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
              Temperatura
            </label>
            <input
              type="number"
              name="temperature"
              id="temperature"
              value={settings.temperature}
              onChange={handleChange}
              min="0"
              max="2"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Valores mais baixos tornam as respostas mais determinísticas, valores mais altos tornam as respostas mais criativas.
            </p>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 text-right rounded-b-lg">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
} 