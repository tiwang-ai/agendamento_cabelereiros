import React from 'react';
import { AuthProvider } from './AuthContext';
import { AdminAuthProvider } from './AdminAuthContext';
// Importe outros providers aqui

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        {/* Adicione outros providers aqui */}
        {children}
      </AdminAuthProvider>
    </AuthProvider>
  );
};