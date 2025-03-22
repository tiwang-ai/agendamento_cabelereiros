import React, { useState, useEffect } from 'react';

interface BotMetrics {
  total_messages: number;
  active_conversations: number;
  success_rate: number;
  average_response_time: number;
  messages_per_hour: number[];
  top_intents: Array<{ intent: string; count: number }>;
}

interface BotConversation {
  id: number;
  client_name: string;
  client_phone: string;
  salon_name: string;
  start_time: string;
  last_message: string;
  status: 'active' | 'completed' | 'failed';
  messages_count: number;
}

export default function BotMonitoring() {
  const [metrics, setMetrics] = useState<BotMetrics | null>(null);
  const [conversations, setConversations] = useState<BotConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Implementar chamada real à API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay

        // Dados mockados
        setMetrics({
          total_messages: 1234,
          active_conversations: 15,
          success_rate: 87.5,
          average_response_time: 2.3,
          messages_per_hour: Array(24).fill(0).map(() => Math.floor(Math.random() * 100)),
          top_intents: [
            { intent: 'agendamento', count: 450 },
            { intent: 'consulta_horarios', count: 320 },
            { intent: 'cancelamento', count: 180 },
            { intent: 'informacoes', count: 150 },
            { intent: 'reagendamento', count: 134 }
          ]
        });

        setConversations([
          {
            id: 1,
            client_name: 'Maria Silva',
            client_phone: '+5511999999999',
            salon_name: 'Salão Beleza Pura',
            start_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            last_message: 'Gostaria de agendar um horário',
            status: 'active',
            messages_count: 5
          },
          {
            id: 2,
            client_name: 'João Santos',
            client_phone: '+5511988888888',
            salon_name: 'Salão Beleza Pura',
            start_time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            last_message: 'Quero cancelar meu horário',
            status: 'active',
            messages_count: 3
          }
        ]);
      } catch (error) {
        console.error('Erro ao buscar dados de monitoramento:', error);
        setError('Não foi possível carregar os dados de monitoramento do bot.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Atualiza a cada minuto
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
        {error || 'Erro ao carregar métricas do bot.'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Monitoramento do Bot</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
          className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="1h">Última hora</option>
          <option value="24h">Últimas 24 horas</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
        </select>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total de Mensagens</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.total_messages}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Conversas Ativas</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.active_conversations}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Taxa de Sucesso</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.success_rate}%</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Tempo Médio de Resposta</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{metrics.average_response_time}s</p>
        </div>
      </div>

      {/* Gráfico de Mensagens por Hora */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mensagens por Hora</h3>
        <div className="h-64">
          <div className="flex h-full items-end space-x-2">
            {metrics.messages_per_hour.map((count, index) => (
              <div
                key={index}
                className="flex-1 bg-primary-100 hover:bg-primary-200 transition-all"
                style={{ height: `${(count / Math.max(...metrics.messages_per_hour)) * 100}%` }}
              >
                <div className="text-xs text-center -mt-6">{count}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {Array.from({ length: 24 }).map((_, index) => (
              <div key={index}>{index}h</div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Intenções */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Intenções</h3>
        <div className="space-y-4">
          {metrics.top_intents.map(({ intent, count }) => (
            <div key={intent} className="flex items-center">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{intent}</div>
                <div className="text-sm text-gray-500">{count} mensagens</div>
              </div>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600"
                  style={{
                    width: `${(count / metrics.top_intents[0].count) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversas Ativas */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Conversas Ativas</h3>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salão
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Início
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Mensagem
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <tr key={conversation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{conversation.client_name}</div>
                    <div className="text-sm text-gray-500">{conversation.client_phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{conversation.salon_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(conversation.start_time).toLocaleTimeString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(conversation.start_time).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{conversation.last_message}</div>
                    <div className="text-sm text-gray-500">{conversation.messages_count} mensagens</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      conversation.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : conversation.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {conversation.status === 'active' ? 'Ativa' :
                       conversation.status === 'completed' ? 'Concluída' : 'Falha'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 