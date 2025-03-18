import React, { useState, useRef, useEffect } from 'react';
import { generateResponse } from '@/services/openai';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: `You are an AI assistant for a beauty salon management system. You can help with:
      - Analyzing appointment data and trends
      - Providing insights about client behavior
      - Suggesting business improvements
      - Answering questions about services and professionals
      
      Be professional, concise, and helpful. Format responses using markdown when appropriate.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchBusinessData = async () => {
    if (!user) return null;

    try {
      const { data: salonData } = await supabase
        .from('salons')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (!salonData) return null;

      const [appointmentsData, clientsData, professionalsData, servicesData] = await Promise.all([
        supabase
          .from('appointments')
          .select('*, client:clients(name), professional:professionals(name), service:services(name, price)')
          .eq('salon_id', salonData.id),
        supabase
          .from('clients')
          .select('*')
          .eq('salon_id', salonData.id),
        supabase
          .from('professionals')
          .select('*')
          .eq('salon_id', salonData.id),
        supabase
          .from('services')
          .select('*')
          .eq('salon_id', salonData.id)
      ]);

      return {
        salon: salonData,
        appointments: appointmentsData.data || [],
        clients: clientsData.data || [],
        professionals: professionalsData.data || [],
        services: servicesData.data || []
      };
    } catch (error) {
      console.error('Error fetching business data:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const businessData = await fetchBusinessData();
      const contextMessage = {
        role: 'system' as const,
        content: `Current business data:
        ${JSON.stringify(businessData, null, 2)}
        
        Use this data to provide accurate insights and answers.`
      };

      const response = await generateResponse([...messages, contextMessage, userMessage]);
      if (response) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again later.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
        <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
        <p className="text-sm text-gray-500">
          Ask me anything about your salon's data, appointments, clients, or business insights.
        </p>
      </div>

      <div className="flex-1 bg-white shadow-sm rounded-lg p-4 mb-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.slice(1).map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <ReactMarkdown className="prose prose-sm max-w-none">
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2">
                <ArrowPathIcon className="h-5 w-5 animate-spin text-gray-500" />
                <span className="text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}