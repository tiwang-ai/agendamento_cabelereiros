# Frontend do Sistema de Agendamento de Cabeleireiros - Estrutura `/src`

## Visão Geral da Pasta `src`
A pasta `src` contém todo o código fonte da aplicação frontend. Esta documentação explica a estrutura, os componentes principais e os fluxos de dados da aplicação.

## Estrutura de Diretórios
```
src/
├── components/   # Componentes reutilizáveis da UI
├── contexts/     # Contextos React para gerenciamento de estado global
├── lib/          # Configurações e utilitários
├── pages/        # Componentes de páginas completas
├── services/     # Serviços para comunicação com APIs
├── types/        # Definições de tipos TypeScript
├── App.tsx       # Componente principal da aplicação
├── main.tsx      # Ponto de entrada da aplicação
├── index.css     # Estilos globais
└── env.d.ts      # Definições de tipos para variáveis de ambiente
```

## Arquivos Principais
### `main.tsx`
Ponto de entrada da aplicação React. Responsável por:
- Renderizar o componente `App` dentro do `AppProviders`
- Inicializar a aplicação no elemento root do DOM

### `App.tsx`
Componente principal que define a estrutura de rotas da aplicação. Características:
- Utiliza `react-router-dom` para gerenciamento de rotas
- Implementa proteção de rotas baseada em autenticação
- Define três áreas principais: Admin, Salon (Cliente) e rotas públicas

### `env.d.ts`
Define tipos para as variáveis de ambiente utilizadas na aplicação:

### `index.css`
Contém estilos globais da aplicação:
- Configurações do Tailwind CSS
- Estilos para o FullCalendar
- Utilitários CSS personalizados

## Diretórios Principais
### `/components`
Contém componentes React reutilizáveis, organizados por domínio:
- `admin/`: Componentes específicos para a área administrativa
- `ClientLayout.tsx`: Layout para área de clientes/salões
- `AdminLayout.tsx`: Layout para área administrativa
- `ServiceForm.tsx`, `ServiceEditForm.tsx`: Formulários para serviços
- `ProfessionalForm.tsx`, `ProfessionalEditForm.tsx`: Formulários para profissionais
- `ClientForm.tsx`, `ClientEditForm.tsx`: Formulários para clientes
- `AppointmentForm.tsx`: Formulário para agendamentos
- `PrivateRoute.tsx`: Componente para proteção de rotas
- Outros componentes de UI reutilizáveis

### `/contexts`
Implementa Context API do React para gerenciamento de estado global:
- `AuthContext.tsx`: Gerencia estado de autenticação geral
- `AdminAuthContext.tsx`: Gerencia estado de autenticação administrativa
- `AppProviders.tsx`: Agrupa todos os provedores de contexto

### `/lib`
Configurações e utilitários:
- `axios.ts`: Configuração do cliente HTTP com interceptors para refresh token
- `database.types.ts`: Tipos do Supabase
- `storage.ts`: Utilitários para armazenamento

### `/pages`
Componentes de página completos, organizados por áreas:
- `admin/`: Páginas administrativas
- `auth/`: Páginas de autenticação (login, registro)
- `client/`: Páginas para clientes/salões
- `settings/`: Páginas de configurações
- `Data/`: Páginas relacionadas a dados
- Páginas principais:
  - `Dashboard.tsx`: Painel principal
  - `Calendar.tsx`: Calendário de agendamentos
  - `Appointments.tsx`: Gerenciamento de agendamentos
  - `Clients.tsx`: Gestão de clientes
  - `Professionals.tsx`: Gestão de profissionais
  - `Services.tsx`: Gestão de serviços
  - `Assistant.tsx`: Assistente virtual

### `/services`
Serviços para comunicação com APIs externas:
- `auth.ts`: Serviços de autenticação
- `whatsapp.ts`: Serviços de integração com WhatsApp

### `/types`
Definições de tipos TypeScript compartilhados.

## Convenções e Boas Práticas
- **Nomenclatura**: PascalCase para componentes, camelCase para funções/variáveis
- **Exportações**: Preferencialmente exportações nomeadas, exceto para componentes de página
- **Tipagem**: Uso consistente de TypeScript para todos os componentes e funções
- **Props**: Interfaces explícitas para props de componentes
- **Estilos**: Tailwind CSS para estilização
- **Estado**: Context API para estado global, hooks para estado local
- **API**: Serviços centralizados em `/services`

## Configuração e Variáveis de Ambiente
A aplicação utiliza as seguintes variáveis de ambiente:
- `VITE_API_URL`: URL base da API do backend
- `VITE_EVOLUTION_API_URL`: URL da API Evolution para WhatsApp
- `VITE_EVOLUTION_API_KEY`: Chave de API do Evolution
- `VITE_SUPABASE_URL`: URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase

## Dependências Principais
- **React 18**: Biblioteca de UI
- **React Router 6**: Gerenciamento de rotas
- **Axios**: Cliente HTTP
- **Tailwind CSS**: Framework CSS utilitário
- **FullCalendar**: Componente de calendário
- **Heroicons**: Ícones SVG
- **React Hook Form**: Gerenciamento de formulários
