# Componentes da Interface de Usuário

## Visão Geral

A pasta `components` contém todos os componentes reutilizáveis da interface de usuário da aplicação. Estes componentes são organizados por domínio, seguindo uma estrutura hierárquica que facilita a manutenção e reusabilidade.

## Estrutura de Componentes

```
components/
├── admin/              # Componentes específicos da área administrativa
├── PrivateRoute.tsx    # Componente de proteção de rotas
├── AdminLayout.tsx     # Layout para área administrativa
├── ClientLayout.tsx    # Layout para área de clientes/salões
├── Navbar.tsx          # Barra de navegação
├── ServiceForm.tsx     # Formulário de serviços
├── ServiceEditForm.tsx # Formulário de edição de serviços
├── ProfessionalForm.tsx     # Formulário de profissionais
├── ProfessionalEditForm.tsx # Formulário de edição de profissionais
├── ProfessionalSchedule.tsx # Agenda de profissionais
├── ClientForm.tsx      # Formulário de clientes
├── ClientEditForm.tsx  # Formulário de edição de clientes
├── ClientHistory.tsx   # Histórico de clientes
└── AppointmentForm.tsx # Formulário de agendamentos
```

## Componentes de Layout
### `AdminLayout.tsx`
Layout principal para a área administrativa. Características:
- Implementa o menu lateral de navegação
- Gerencia o estado de colapso do menu
- Exibe informações do usuário autenticado
- Implementa logout


### `ClientLayout.tsx`
Layout principal para a área de clientes/salões. Similar ao AdminLayout, mas com navegação adaptada para as necessidades do salão.

## Componentes de Formulários
### `ServiceForm.tsx`
Formulário para criação de serviços. Funcionalidades:
- Validação de campos
- Submissão para a API
- Feedback de sucesso/erro
- Upload de imagem (integração com Supabase)


### `AppointmentForm.tsx`
Formulário complexo para criação/edição de agendamentos. Implementa:
- Seleção de cliente (com busca)
- Seleção de profissional
- Seleção de serviço
- Seleção de data/horário com validação de disponibilidade
- Visualização de agenda do profissional

### `ProfessionalSchedule.tsx`
Componente avançado para visualização e gerenciamento da agenda de profissionais:
- Integração com FullCalendar
- Visualização de horários disponíveis/ocupados
- Criação rápida de agendamentos
- Filtros por data/serviço

## Componentes de Proteção de Rotas
### `PrivateRoute.tsx`
Componente para proteger rotas que requerem autenticação:

## Componentes Relacionados a Clientes
### `ClientHistory.tsx`
Exibe o histórico de agendamentos de um cliente:
- Listagem de agendamentos passados e futuros
- Filtros por período
- Estatísticas de fidelidade e valor gasto
- Opções para reagendamento e cancelamento

## Padrões e Boas Práticas
### Tipagem de Props
Todos os componentes utilizam interfaces TypeScript para definir suas props

### Composição vs. Herança
Os componentes seguem o princípio de composição ao invés de herança:

### Reutilização de Estilos
Componentes mantêm consistência visual através de classes Tailwind padronizadas:


### Gestão de Estado
Os componentes usam a abordagem adequada para cada tipo de estado:
- **Estado Local**: `useState` para estado específico do componente
- **Estado de Formulários**: React Hook Form para formulários complexos
- **Estado Global**: Contextos ou hooks personalizados para estado compartilhado
- **Estado Derivado**: Memorização com `useMemo` para computações caras


## Padrões de Comunicação
Os componentes se comunicam principalmente através de:
1. **Props**: Para dados e callbacks de pai para filho
2. **Contextos**: Para estado global compartilhado
3. **Eventos Customizados**: Para comunicação entre componentes não relacionados


## Componentes Planejados
Além dos componentes existentes, os seguintes estão planejados ou em desenvolvimento:
- **Notification.tsx**: Sistema de notificações/toasts
- **Pagination.tsx**: Componente de paginação para listas
- **FilterPanel.tsx**: Painel de filtros avançados
- **ImageUploader.tsx**: Componente especializado para upload de imagens
- **Calendar.tsx**: Componente independente de calendário/agenda
