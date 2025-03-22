import React, { useState, useEffect } from 'react';

interface MessageTemplate {
  id: number;
  name: string;
  description: string;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function BotTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // TODO: Implementar chamada real à API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay

        // Dados mockados
        setTemplates([
          {
            id: 1,
            name: 'Boas-vindas',
            description: 'Mensagem inicial enviada ao cliente',
            content: 'Olá {nome}! Bem-vindo ao {salao}. Como posso ajudar você hoje?',
            variables: ['nome', 'salao'],
            is_active: true,
            created_at: '2024-03-15T10:00:00Z',
            updated_at: '2024-03-15T10:00:00Z'
          },
          {
            id: 2,
            name: 'Confirmação de Agendamento',
            description: 'Confirmação após agendamento bem-sucedido',
            content: 'Seu agendamento foi confirmado!\n\nData: {data}\nHorário: {horario}\nServiço: {servico}\nProfissional: {profissional}\n\nAguardamos você!',
            variables: ['data', 'horario', 'servico', 'profissional'],
            is_active: true,
            created_at: '2024-03-15T10:00:00Z',
            updated_at: '2024-03-15T10:00:00Z'
          }
        ]);
      } catch (error) {
        console.error('Erro ao buscar templates:', error);
        setError('Não foi possível carregar os templates de mensagem.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;

    try {
      // TODO: Implementar chamada real à API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay

      setTemplates(templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      ));
      setIsEditing(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      setError('Não foi possível salvar as alterações.');
    }
  };

  const handleToggleActive = async (templateId: number) => {
    try {
      // TODO: Implementar chamada real à API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay

      setTemplates(templates.map(t => 
        t.id === templateId ? { ...t, is_active: !t.is_active } : t
      ));
    } catch (error) {
      console.error('Erro ao atualizar status do template:', error);
      setError('Não foi possível atualizar o status do template.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Templates de Mensagem</h1>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          onClick={() => {
            setEditingTemplate({
              id: Math.max(...templates.map(t => t.id)) + 1,
              name: '',
              description: '',
              content: '',
              variables: [],
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            setIsEditing(true);
          }}
        >
          Novo Template
        </button>
      </div>

      {/* Lista de Templates */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variáveis
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Atualização
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{template.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable) => (
                      <span
                        key={variable}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(template.id)}
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      template.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {template.is_active ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(template.updated_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      {isEditing && editingTemplate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">
              {editingTemplate.id ? 'Editar Template' : 'Novo Template'}
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <input
                  type="text"
                  id="description"
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Conteúdo
                </label>
                <textarea
                  id="content"
                  rows={4}
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="variables" className="block text-sm font-medium text-gray-700">
                  Variáveis (separadas por vírgula)
                </label>
                <input
                  type="text"
                  id="variables"
                  value={editingTemplate.variables.join(', ')}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    variables: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditingTemplate(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 