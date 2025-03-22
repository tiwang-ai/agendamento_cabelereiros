/**
 * Componentes UI básicos
 * 
 * Este arquivo exporta componentes UI reutilizáveis básicos.
 * Por enquanto, estamos usando componentes simples baseados em Tailwind.
 * No futuro, podemos evoluir para componentes mais complexos.
 */
import React from 'react';

// Botão básico
export const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      props.className || 'bg-primary-600 text-white hover:bg-primary-700'
    }`}
  >
    {children}
  </button>
);

// Input básico
export const Input = ({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${props.className || ''}`}
  />
);

// Dialog (modal) básico
export const Dialog = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        <div className="relative bg-white rounded-lg p-6 max-w-lg w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

// Mensagem de feedback
export const Message = ({ type = 'info', children }: { type: 'success' | 'error' | 'info' | 'warning'; children: React.ReactNode }) => {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  };

  return (
    <div className={`p-4 rounded-md border ${styles[type]}`}>
      {children}
    </div>
  );
};

// Spinner de carregamento
export const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
); 