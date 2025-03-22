# Páginas da Aplicação
## Visão Geral
A pasta `pages` contém os componentes de nível superior que representam as páginas completas da aplicação. Estes componentes são utilizados diretamente pelo sistema de rotas e geralmente compõem a experiência principal do usuário.

## Estrutura de Diretórios
```
pages/
├── admin/           # Páginas da área administrativa
│   ├── Dashboard.tsx
│   ├── SalonsManagement.tsx
│   ├── Plans.tsx
│   ├── Reports.tsx
│   ├── SalonUsers.tsx
│   └── Support.tsx
├── auth/            # Páginas de autenticação
│   ├── Login.tsx
│   └── Register.tsx
├── client/          # Páginas para clientes/salões
│   ├── Calendar.tsx
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   └── ...
├── settings/        # Páginas de configurações
├── Data/            # Páginas relacionadas a dados e gerenciamento
│   └── index.tsx
├── Dashboard.tsx    # Dashboard principal
├── Calendar.tsx     # Calendário de agendamentos
├── Appointments.tsx # Gerenciamento de agendamentos
├── Clients.tsx      # Lista de clientes
├── Professionals.tsx # Lista de profissionais
├── Services.tsx     # Lista de serviços
└── Assistant.tsx    # Assistente virtual
```

## Páginas Principais
### `Dashboard.tsx`
Página inicial que exibe informações resumidas e métricas importantes para o usuário:
- Agendamentos do dia
- Métricas de desempenho
- Atividades recentes
- Alertas e notificações

### `Calendar.tsx`
Página de visualização e gerenciamento de calendário de agendamentos:
- Visualização de calendário completo
- Múltiplas visões (dia, semana, mês)
- Criação e edição de agendamentos
- Filtros por profissional, serviço

### `Appointments.tsx`
Página de listagem e gerenciamento de agendamentos:

- Listagem completa de agendamentos
- Filtros avançados
- Ações em lote
- Status e métricas

### `Login.tsx` e `Register.tsx`
Páginas de autenticação:
- Formulários de login e registro
- Validação de campos
- Feedback de erros
- Redirecionamento após autenticação

## Áreas Específicas
### Área Administrativa (`/admin/`)
Páginas dedicadas aos administradores do sistema:
- **Dashboard.tsx**: Visão geral administrativa
- **SalonsManagement.tsx**: Gerenciamento de salões cadastrados
- **SalonUsers.tsx**: Gerenciamento de usuários de um salão específico
- **Plans.tsx**: Gerenciamento de planos e assinaturas
- **Reports.tsx**: Relatórios administrativos
- **Support.tsx**: Sistema de suporte

### Área de Cliente/Salão (`/client/`)
Páginas para donos e funcionários de salões:
- **Dashboard.tsx**: Visão geral do salão
- **Calendar.tsx**: Calendário específico do salão
- **Appointments.tsx**: Gerenciamento de agendamentos do salão
- **Services.tsx**: Gerenciamento de serviços oferecidos
- **Settings.tsx**: Configurações do salão

### Área de Dados (`/Data/`)
Páginas para gerenciamento de dados principais

## Integração com Rotas
As páginas são associadas a rotas no arquivo `App.tsx`

## Padrões e Boas Práticas
1. **Separação de Responsabilidades**: Cada página cuida de uma funcionalidade específica
2. **Composição**: Páginas compõem componentes menores e reutilizáveis
3. **Hooks para Lógica**: Uso de hooks personalizados para extrair lógica complexa
4. **Lazy Loading**: Carregamento tardio para páginas grandes (não implementado ainda)
5. **Centralização de Estados**: Uso de contextos para estado global

## Páginas Planejadas
Além das páginas existentes, as seguintes estão planejadas:
- **WhatsAppConfig.tsx**: Configuração da integração com WhatsApp
- **Analytics.tsx**: Análises avançadas de desempenho
- **MarketingCampaigns.tsx**: Gerenciamento de campanhas de marketing
- **UserProfile.tsx**: Perfil de usuário detalhado
- **HelpCenter.tsx**: Centro de ajuda e documentação
