import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'beauty-salon-system'
    }
  },
  db: {
    schema: 'public'
  }
});

// Função auxiliar para verificar a conexão
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('salons').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro na conexão com Supabase:', error);
    return false;
  }
}