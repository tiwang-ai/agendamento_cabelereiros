import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'support' | 'financial' | 'technical';
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  signInAdmin: (email: string, password: string) => Promise<{ error: string | null }>;
  signOutAdmin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  adminUser: null,
  signInAdmin: async () => ({ error: null }),
  signOutAdmin: () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const signInAdmin = async (email: string, password: string) => {
    try {
      // First try to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If sign in fails with invalid credentials, try to sign up
      if (signInError?.message === 'Invalid login credentials') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: 'super_admin'
            }
          }
        });

        if (signUpError) {
          console.error('Error creating auth user:', signUpError);
          return { error: 'Erro ao criar usuário. Por favor, tente novamente.' };
        }

        // Try signing in again after signup
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (retryError) {
          return { error: 'Credenciais administrativas inválidas' };
        }
      } else if (signInError) {
        return { error: 'Credenciais administrativas inválidas' };
      }

      // Check if user exists in admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, role')
        .eq('email', email)
        .eq('active', true)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        return { error: 'Credenciais administrativas inválidas' };
      }

      // Update last sign in
      await supabase
        .from('admin_users')
        .update({ last_sign_in_at: new Date().toISOString() })
        .eq('id', adminData.id);

      setAdminUser(adminData);
      return { error: null };

    } catch (error) {
      console.error('Error during admin login:', error);
      return { error: 'Erro ao fazer login. Por favor, tente novamente.' };
    }
  };

  const signOutAdmin = async () => {
    await supabase.auth.signOut();
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, signInAdmin, signOutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}