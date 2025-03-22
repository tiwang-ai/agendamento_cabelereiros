import React from 'react';
import { AuthProvider } from './AuthContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      {/* Adicione outros providers aqui quando necessário */}
      {children}
    </AuthProvider>
  );
};