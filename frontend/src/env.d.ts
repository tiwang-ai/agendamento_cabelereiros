/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_EVOLUTION_API_URL: string;
  readonly VITE_EVOLUTION_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 