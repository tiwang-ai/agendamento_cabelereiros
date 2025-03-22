/// <reference types="vite/client" />

/**
 * Interface que define os tipos das variáveis de ambiente disponíveis
 * no Vite através de import.meta.env
 * 
 * Todas as variáveis são prefixadas com VITE_ para serem expostas ao cliente
 */
interface ImportMetaEnv {
  // URL base da API do backend
  readonly VITE_API_URL: string;
  
  // DSN opcional do Sentry para monitoramento de erros
  readonly VITE_SENTRY_DSN?: string;
  
  // URL base da API do Evolution para integração com WhatsApp
  readonly VITE_EVOLUTION_API_URL: string;
  
  // Chave de autenticação para a Evolution API
  readonly VITE_EVOLUTION_API_KEY: string;
}

/**
 * Extensão da interface ImportMeta do Vite
 * para incluir nossas variáveis de ambiente tipadas
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
} 