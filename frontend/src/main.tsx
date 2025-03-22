/**
 * Arquivo principal da aplicação React
 * 
 * Este é o ponto de entrada da aplicação onde inicializamos o React
 * e montamos o componente raiz na DOM.
 */

// Importações fundamentais do React
import React from 'react' // Biblioteca principal do React
import ReactDOM from 'react-dom/client' // Pacote para manipulação do DOM
import App from './App.tsx' // Componente raiz da aplicação
import { AppProviders } from './contexts/AppProviders' // Provedores de contexto global
import './index.css' // Estilos globais da aplicação (Tailwind e outros)

// Inicialização do React 18 com a nova API createRoot
// 1. Seleciona o elemento HTML com id 'root' do index.html
// 2. Cria um root React neste elemento
// 3. Renderiza a aplicação dentro deste root
// O operador '!' diz ao TypeScript que temos certeza que o elemento existe
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* StrictMode ativa verificações adicionais e avisos em desenvolvimento */}
    <AppProviders>
      {/* Envolve a aplicação com todos os provedores de contexto necessários */}
      <App />
      {/* Componente raiz da aplicação */}
    </AppProviders>
  </React.StrictMode>,
)