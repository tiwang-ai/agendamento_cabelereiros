/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // outras variáveis de ambiente...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
