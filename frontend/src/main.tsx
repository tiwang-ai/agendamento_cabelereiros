/**
 * Arquivo principal da aplicação React
 * 
 * Este é o ponto de entrada da aplicação onde inicializamos o React
 * e montamos o componente raiz na DOM. Aqui configuramos os providers
 * globais e inicializamos a aplicação.
 */

// Importações fundamentais do React e ReactDOM
import React from 'react' // Core do React para criar componentes
import ReactDOM from 'react-dom/client' // Renderizador do React para web browsers
import App from './App.tsx' // Componente raiz que define a estrutura da aplicação
import { AppProviders } from './contexts/AppProviders' // Wrapper com todos os providers de contexto
import './index.css' // Estilos globais (Tailwind CSS e customizações)

/**
 * Inicialização da aplicação React usando a API do React 18
 * 
 * O processo acontece em 3 etapas:
 * 1. Encontra o elemento root no DOM (definido no index.html)
 * 2. Cria uma raiz React neste elemento usando createRoot
 * 3. Renderiza a aplicação dentro desta raiz
 * 
 * O operador '!' é um non-null assertion operator do TypeScript,
 * indicando que temos certeza que o elemento existe
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 
      StrictMode é um wrapper que ativa verificações adicionais em desenvolvimento:
      - Identifica componentes com ciclos de vida legados
      - Avisa sobre efeitos colaterais na renderização
      - Detecta usos não seguros de APIs legadas
    */}
    <AppProviders>
      {/* 
        AppProviders engloba todos os Context Providers necessários:
        - Autenticação
        - Temas
        - Estado global
        - etc.
      */}
      <App />
      {/* Componente raiz que define toda a estrutura da aplicação */}
    </AppProviders>
  </React.StrictMode>,
)