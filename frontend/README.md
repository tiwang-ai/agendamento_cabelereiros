# Sistema de Agendamento de Cabeleireiros - Frontend

## Visão Geral

Este é o frontend do sistema de gerenciamento de salões de cabeleireiro, desenvolvido com React, TypeScript e Vite. A aplicação permite o gerenciamento completo de salões, profissionais, serviços, clientes e agendamentos, com uma interface moderna e intuitiva.

## Modo de Dados Mockados

Atualmente, a aplicação está configurada para utilizar dados mockados em vez de conectar-se a uma API real. Isso foi implementado para facilitar o desenvolvimento e testes da interface sem depender de um backend funcionando.

### Características do Modo Mockado:

- Dados simulados para todas as entidades (salões, profissionais, clientes, agendamentos, etc.)
- Simulação de delay de rede para experiência realista
- Fluxo completo da aplicação pode ser testado sem backend
- Fácil transição para API real quando necessário

### Como Alternar Modos (Mock / API Real):

No momento, para retornar à integração com API real, será necessário:

1. Remover os dados mockados dos componentes
2. Restaurar as chamadas originais de API
3. Configurar a URL da API nas variáveis de ambiente

## Funcionalidades Principais

- **Autenticação e Gerenciamento de Usuários**
  - Login e cadastro de usuários
  - Perfis específicos (Administrador, Dono de Salão, Profissional, Recepcionista)
  - Proteção de rotas baseada em permissões
- **Gerenciamento de Salões**
  - Configurações de salão
  - Horários de funcionamento
  - Gerenciamento de profissionais
  - Catálogo de serviços
- **Agendamentos**
  - Calendário completo
  - Agendamento de serviços
  - Confirmação, cancelamento e reagendamento
  - Notificações via WhatsApp
- **Painel Administrativo**
  - Dashboard com métricas
  - Relatórios financeiros
  - Gerenciamento de usuários
  - Configurações do sistema
- **Integração WhatsApp**
  - Configuração de conexão
  - Envio de mensagens automáticas
  - QR Code para autenticação
  - Webhooks para recebimento de mensagens

## Tecnologias Utilizadas

- **React 18**: Biblioteca de UI
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e servidor de desenvolvimento
- **React Router 6**: Gerenciamento de rotas
- **Tailwind CSS**: Framework CSS utilitário
- **Axios**: Cliente HTTP
- **React Hook Form**: Gerenciamento de formulários
- **FullCalendar**: Componente de calendário
- **Context API**: Gerenciamento de estado global
- **Heroicons**: Ícones SVG

## Estrutura do Projeto

```
frontend/
├── src/                    # Código fonte principal
│   ├── components/         # Componentes reutilizáveis
│   │   ├── common/         # Componentes compartilhados e genéricos
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   ├── layout/         # Layouts principais
│   │   │   ├── AdminLayout.tsx
│   │   │   └── ClientLayout.tsx
│   │   ├── professionals/  # Componentes relacionados a profissionais
│   │   │   ├── ProfessionalForm.tsx
│   │   │   ├── ProfessionalList.tsx
│   │   │   └── ProfessionalSchedule.tsx
│   │   ├── clients/        # Componentes relacionados a clientes
│   │   │   ├── ClientForm.tsx
│   │   │   └── ClientHistory.tsx
│   │   ├── services/       # Componentes de serviços
│   │   │   ├── ServiceForm.tsx
│   │   │   └── ServiceList.tsx
│   │   ├── appointments/   # Componentes de agendamentos
│   │   │   └── AppointmentForm.tsx
│   │   └── admin/          # Componentes específicos de administração
│   │       ├── SalonUserForm.tsx
│   │       ├── PlanManagement.tsx
│   │       └── ...
│   ├── contexts/           # Contextos React (autenticação, etc.)
│   │   ├── auth/           # Contextos de autenticação
│   │   │   ├── AuthContext.tsx     # Contexto geral
│   │   │   └── AdminAuthContext.tsx # Contexto específico admin
│   │   ├── appointments/      # Contextos de agendamentos
│   │   │   └── AppointmentContext.tsx
│   ├── lib/                # Bibliotecas e configurações
│   ├── pages/              # Páginas da aplicação
│   ├── services/           # Serviços de comunicação com API
│   │   ├── api.ts             # Configuração base da API
│   │   ├── auth/              # Serviços de autenticação
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── professionals/     # Serviços para profissionais
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   └── types/              # Definições de tipos TypeScript
│   │   ├── auth.ts            # Tipos relacionados à autenticação
│   │   ├── user.ts            # Tipos de usuários
│   │   ├── salon.ts           # Tipos relacionados a salões
│   │   ├── appointment.ts     # Tipos de agendamento
└── public/                 # Arquivos estáticos
```

Para detalhes sobre cada parte do projeto, consulte os READMEs específicos:

- [Documentação da Pasta src](./src/README.md)
- [Documentação de Componentes](./src/components/README.md)
- [Documentação de Contextos](./src/contexts/README.md)
- [Documentação de Páginas](./src/pages/README.md)
- [Documentação de Serviços](./src/services/README.md)
- [Documentação de Bibliotecas](./src/lib/README.md)

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 16+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install
# Configurar variáveis de ambiente (opcional para modo mockado)
# Crie um arquivo .env baseado no .env.example
cp .env.example .env
# Iniciar servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

O projeto utiliza as seguintes variáveis de ambiente quando não está em modo mockado:

```
# URL da API do backend
VITE_API_URL=http://localhost:8000

# Configurações da Evolution API (WhatsApp)
VITE_EVOLUTION_API_URL=https://api.exemplo.com
VITE_EVOLUTION_API_KEY=sua-chave-api

# Controle do modo de mockado (quando implementado)
VITE_USE_MOCK_DATA=true
```

## Fluxos Principais

### Fluxo de Autenticação

1. Usuário acessa a página de login
2. Fornece credenciais (email/senha ou telefone/senha)
3. Em modo mockado: Credenciais pré-definidas são aceitas automaticamente
4. Em modo API: Frontend envia dados para o endpoint de autenticação
5. Armazenamento de token e redirecionamento para área apropriada

### Fluxo de Agendamento

1. Usuário acessa a página de agendamento
2. Seleciona cliente, profissional, serviço
3. Seleciona data e hora disponível
4. Confirma agendamento
5. Sistema envia confirmação por WhatsApp ao cliente

### Fluxo de WhatsApp

1. Usuário acessa a página de configuração do WhatsApp
2. Sistema gera QR Code via Evolution API
3. Usuário escaneia QR Code com WhatsApp
4. Conexão é estabelecida e webhooks são configurados
5. Sistema começa a processar mensagens automaticamente

## Integração com o Backend

A comunicação com o backend é feita através de uma API REST implementada em Django:

- Tokens JWT para autenticação
- Endpoints RESTful para todas as operações
- Estrutura de resposta padronizada

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera o build de produção
- `npm run preview` - Visualiza o build de produção localmente
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código com Prettier

## Deploy

O frontend está configurado para deploy na Vercel:

1. Criar um projeto na Vercel
2. Conectar ao repositório GitHub
3. Configurar as variáveis de ambiente
4. Definir o diretório raiz como `frontend`
5. A Vercel irá detectar automaticamente o projeto Vite

### Configuração de Deploy

```
# vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

## Documentação Adicional

Para mais detalhes sobre o funcionamento da aplicação, consulte:

- [Plano de Integração com Backend](/next-steps.md)
- [Documentação do Backend](/core/README.md)

## Próximos Passos

- Implementação de testes unitários e de integração
- Melhorias de acessibilidade
- Implementação de PWA (Progressive Web App)
- Transição do modo mockado para integração com API real
- Suporte a temas escuros
- Melhorias de performance e otimização de bundle

## Uso das Versões Mockadas

### Dashboards

Os dashboards (administrador, proprietário do salão) foram adaptados para usar dados mockados:

- Mockados com estatísticas plausíveis
- Atualização simulada a cada minuto (no dashboard do salão)
- Visualização de logs de auditoria simulados (admin)
- Dados de agendamentos fictícios, mas representativos do uso real

### Autenticação

O sistema de autenticação foi configurado com modo mockado:

- Aceitação de credenciais pré-definidas
- Simulação de token JWT
- Controle de sessão via Context API
- Proteção de rotas baseada no perfil simulado

### Considerações para o Desenvolvimento

Ao trabalhar no código, lembre-se:

- Os dados mockados estão diretamente no código-fonte (não em arquivos externos)
- Alterações nos dados mockados afetam diretamente a UI
- A estrutura dos dados mockados deve seguir as interfaces TypeScript definidas

## Status da Migração

### Arquivos Migrados para Dados Mockados

Os seguintes arquivos foram migrados do Supabase para usar dados mockados:

1. `frontend/src/lib/supabase.ts` - Criado mock para supabase
2. `frontend/src/pages/client/Dashboard.tsx` - Dashboard do cliente com dados mockados
3. `frontend/src/pages/Services.tsx` - Gerenciamento de serviços com dados mockados
4. `frontend/src/components/ServiceForm.tsx` - Formulário de criação de serviços
5. `frontend/src/components/ServiceEditForm.tsx` - Formulário de edição de serviços
6. `frontend/src/pages/Professionals.tsx` - Gerenciamento de profissionais com dados mockados
7. `frontend/src/pages/admin/SalonsManagement.tsx` (renomeado de Establishments.tsx) - Gerenciamento de salões

### Arquivos Pendentes para Migração

Existem vários arquivos que ainda precisam ser migrados para usar dados mockados em vez do Supabase:

1. Formulários de profissionais (`ProfessionalForm.tsx`, `ProfessionalEditForm.tsx`)
2. Componentes de agenda (`ProfessionalSchedule.tsx`)
3. Páginas de clientes (`Clients.tsx`)
4. Páginas de calendário e agendamentos
5. Dashboards administrativos
6. Componentes de configurações

### Como Proceder com a Migração

Para continuar a migração, é necessário:

1. Identificar os tipos de dados usados em cada arquivo
2. Criar estruturas de dados mockados para cada entidade
3. Substituir chamadas ao Supabase por funções que simulam operações de API
4. Traduzir todos os textos da interface para português
5. Garantir que todas as funcionalidades continuem operando corretamente

Quando o sistema estiver completamente migrado, ele poderá ser facilmente conectado a qualquer backend que implemente a API necessária.

## Acessos para Desenvolvimento (Mock)

Durante o desenvolvimento, o sistema está configurado para usar autenticação mockada. Use as seguintes credenciais para testar diferentes perfis de acesso:

### Superusuário (Acesso Total)

- Email: superuser@example.com
- Senha: superuser123
- Acesso: Área administrativa completa, incluindo:
  - Gerenciamento de usuários
  - Configurações do bot
  - Todos os acessos do administrador

### Administrador

- Email: admin@example.com
- Senha: admin123
- Acesso: Área administrativa limitada:
  - Gerenciamento de salões
  - Planos
  - Relatórios
  - Suporte

### Dono de Salão

- Email: salon@example.com
- Senha: salon123
- Acesso: Gestão completa do salão:
  - Dashboard
  - Agendamentos
  - Profissionais
  - Serviços
  - Clientes
  - WhatsApp

### Profissional

- Email: professional@example.com
- Senha: professional123
- Acesso: Gestão da própria agenda:
  - Agenda pessoal
  - Clientes próprios
  - Serviços realizados

### Recepcionista

- Email: receptionist@example.com
- Senha: receptionist123
- Acesso: Gestão de agendamentos:
  - Calendário
  - Agendamentos
  - Clientes

### Observações

- O modo mockado está ativado por padrão para desenvolvimento
- Os dados são resetados ao recarregar a página
- Tokens são armazenados no localStorage
- Para desativar o modo mock, altere `USE_MOCK_AUTH` em `src/services/auth.ts`
