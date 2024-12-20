# Sistema de Agendamento para Salão de Beleza

## Descrição

Este projeto fornece um sistema de agendamento e atendimento via WhatsApp para salões de beleza e barbearias, com integração de uma LLM para comunicação automatizada. Ele permite a configuração de dois bots: um para nós atendermos os salões (nossos clientes) (Bot 1); e outro para atender os clientes finais dos salões (Bot 2).

## Configuração do Ambiente

### Pré-requisitos

- Python 3.8+
- PostgreSQL
- Redis
- Node.js 16+

### Backend

1. Criar ambiente virtual:

```
python -m venv venv
source venv/bin/activate # Linux/Mac
ou
venv\Scripts\activate # Windows
```

2. Instalar dependências: `pip install -r requirements.txt`
3. Configurar banco de dados:

- Criar banco PostgreSQL chamado 'tiwang_db'
- Ajustar credenciais em settings.py

4. Aplicar migrações: `python manage.py makemigrations && python manage.py migrate`
5. Iniciar serviços (em terminais separados):

- Terminal 1 - Django: `python manage.py runserver`
- Terminal 2 - Redis (necessário para Celery): `redis-server`
- Terminal 3 - Celery Worker: `celery -A agendamento_salao worker -l info`
- Terminal 4 - Celery Beat: `celery -A agendamento_salao beat -l info`

### Frontend

1. Instalar dependências: `cd frontend && npm install`
2. Iniciar servidor de desenvolvimento: `npm run dev`

## Estrutura do Projeto

```
Teste_Agendamento-TIWANG/
├── core/
│   ├── integrations/
│   │   └── evolution.py       # Integração com a Evolution API
│   ├── migrations/
│   │   └── ...
│   ├── services/
│   │   ├── reports.py         # Serviços para relatórios
│   │   └── system_logs.py     # Serviços para monitoramento e logs do sistema
│   ├── views.py               # Views principais, incluindo o processamento de perguntas para os bots
│   ├── admin.py               # Configuração do painel administrativo
│   ├── apps.py                # Configuração dos apps do projeto
│   ├── models.py              # Modelos do banco de dados (Salão, Agendamento, etc.)
│   ├── urls.py                # Definição das rotas da API
│   ├── filters.py             # Filtros específicos para cada bot
│   ├── llm_utils.py           # Funções de integração com a LLM (prompt engineering, chamada API)
│   ├── serializers.py         # Serializers para conversão dos modelos para JSON
│   ├── tasks.py               # Tarefas assíncronas com Celery (ex: relatórios automáticos)
│   ├── middleware.py          # Middleware para atualização de atividade do usuário
│   └── tests.py               # Testes para as principais funcionalidades
├── agendamento_salao/
│   ├── settings.py            # Configurações do projeto Django
│   ├── wsgi.py                # Interface para o servidor web
│   ├── asgi.py                # Interface para ASGI (opcional para WebSocket)
│   ├── urls.py                # URL principal do projeto
│   ├── celery.py              # Configuração do Celery para tarefas assíncronas
│   └── .env                   # Arquivo para variáveis de ambiente (não incluído no Git)
├── frontend/
│   ├── node_modules/
│   │   └── ...
│   ├── public/
│   │   ├── _redirects
│   │   └── vite.svg
│   ├── landing/
│   │   ├── components/
│   │   │   └── Demo/
│   │   │   │   ├── CalendarPreview.tsx
│   │   │   │   ├── ProfessionalsView.tsx
│   │   │   │   ├── BookingConfirmation.tsx
│   │   │   │   └── WhatsAppDemo.tsx
│   │   │   └── Hero.tsx
│   │   ├── pages/
│   │   │   └── index.tsx
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   ├── AppointmentsTable.tsx
│   │   │   ├── AdminNavbar.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── pages/         # Páginas principais
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Finance.tsx
│   │   │   │   ├── SalonDetails.tsx
│   │   │   │   ├── Salons.tsx
│   │   │   │   ├── Users.tsx
│   │   │   │   ├── WhatsAppStatus.tsx
│   │   │   │   ├── Services.tsx
│   │   │   │   ├── TechSupport.tsx
│   │   │   │   ├── Reports.tsx
│   │   │   │   ├── StaffManagement.tsx
│   │   │   │   ├── Profile.tsx
│   │   │   │   └── Plans.tsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── SalonDashboard.tsx
│   │   │   ├── management/
│   │   │   │   ├── Professionals.tsx
│   │   │   │   ├── Finance.tsx
│   │   │   │   ├── Clients.tsx
│   │   │   │   └── Services.tsx
│   │   │   ├── calendar/
│   │   │   │   └── Calendar.tsx
│   │   │   ├── onboarding/
│   │   │   │   ├── steps/
│   │   │   │   │   ├── PaymentStep.tsx
│   │   │   │   │   ├── ProfessionalsStep.tsx
│   │   │   │   │   ├── SalonInfoStep.tsx
│   │   │   │   │   └── ServicesStep.tsx
│   │   │   │   └── OnboardingFlow.tsx
│   │   │   ├── plans/
│   │   │   │   └── PricingPage.tsx
│   │   │   ├── professional/
│   │   │   │   ├── Agenda.tsx
│   │   │   │   ├── Clients.tsx
│   │   │   │   ├── Profile.tsx
│   │   │   │   └── History.tsx
│   │   │   └── settings/
│   │   │       ├── Settings.tsx
│   │   │       ├── ChatManagement.tsx
│   │   │       └── WhatsAppConnection.tsx
│   │   ├── services/      # Serviços de API
│   │   │   ├── payment.ts
│   │   │   ├── auth.ts
│   │   │   ├── plans.ts
│   │   │   ├── finance.ts
│   │   │   ├── salons.ts
│   │   │   ├── users.ts
│   │   │   ├── whatsapp.ts
│   │   │   ├── permissions.ts
│   │   │   ├── botConfig.ts
│   │   │   └── ai.ts
│   │   ├── hooks/         # Custom hooks
│   │   │   ├── useLanguage.ts
│   │   │   └── usePermissions.ts
│   │   ├── contexts/      # Contextos React
│   │   │   └── AuthContext.tsx
│   │   ├── types/         # Tipos/Interfaces
│   │   │   ├── whatsapp.ts
│   │   │   ├── onboarding.ts
│   │   │   ├── global.d.ts
│   │   │   ├── qrcode.d.ts
│   │   │   ├── framer-motion.d.ts
│   │   │   └── auth.ts
│   │   ├── utils/         # Funções utilitárias
│   │   ├── assets/        # Imagens, etc
│   │   │   └── react.svg
│   │   ├── i18n/
│   │   │   ├── locales/
│   │   │   │   ├── pt-BR.json
│   │   │   │   └── en-US.json
│   │   │   └── index.ts
│   │   ├── theme.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .gitignore
│   ├── .eslintignore
│   ├── .eslintrc.cjs
│   ├── .eslintrc.js
│   ├── .npmrc
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── README.md                  # Documentação do projeto
├── requirements.txt           # Dependências do projeto
├── runtime.txt
├── manage.py
├── app.yaml
├── celerybeat-schedule.bak
├── celerybeat-schedule.dat
├── celerybeat-schedule.dir
├── node_modules/
│   └── ...
├── venv/
│   ├── ...
│   └── .gitignore                 # Arquivo para ignorar arquivos sensíveis
```

## Estrutura do Banco de Dados

-- Tabela Estabelecimentos
Estabelecimentos {
id (PK)
nome
endereco
telefone
whatsapp
horario_funcionamento
evolution_instance_id
status
is_active
}

-- Tabela Profissionais
Profissionais {
id (PK)
user_id (FK)
estabelecimento_id (FK)
nome
especialidade
foto
bio
is_active
}

-- Tabela Servicos
Servicos {
id (PK)
estabelecimento_id (FK)
nome_servico
duracao
preco
}

-- Tabela Horarios_Disponiveis
Horarios_Disponiveis {
id (PK)
profissional_id (FK)
dia_semana
horario_inicio
horario_fim
}

-- Tabela Calendario_Estabelecimento
Calendario_Estabelecimento {
id (PK)
estabelecimento_id (FK)
dia_semana
horario_abertura
horario_fechamento
}

-- Tabela Clientes
Clientes {
id (PK)
estabelecimento_id (FK)
nome
whatsapp
email
data_cadastro
observacoes
historico_agendamentos
is_active
}

-- Tabela Agendamentos
Agendamentos {
id (PK)
cliente_id (FK)
profissional_id (FK)
servico_id (FK)
data_agendamento
horario
status
}

-- Tabela Users
Users {
id (PK)
email
phone
name
role (ADMIN/OWNER/PROFESSIONAL/RECEPTIONIST)
estabelecimento_id (FK)
is_active
is_staff
}

Relacionamentos:

- Estabelecimentos 1:N Profissionais
- Estabelecimentos 1:N Servicos
- Estabelecimentos 1:N Clientes
- Estabelecimentos 1:1 Calendario_Estabelecimento
- Profissionais 1:1 Users
- Profissionais 1:N Horarios_Disponiveis
- Profissionais 1:N Agendamentos
- Servicos 1:N Agendamentos
- Clientes 1:N Agendamentos

---

## Funcionalidades

1. **Integração com WhatsApp**:

   - Sistema de comunicação via API para atender e interagir com os clientes pelo WhatsApp.

2. **Gerenciamento de Agendamentos**:
   - Sistema de calendário para armazenar e organizar agendamentos de cada salão.

### Bots de Atendimento

#### Bot 1 (Atendimento ao Salão)

- Atendimento administrativo aos salões
- Respostas sobre relatórios e métricas
- Envio automático de relatórios de desempenho
- Suporte técnico básico

#### Bot 2 (Atendimento ao Cliente)

- Agendamento automatizado via WhatsApp
- Consulta de horários disponíveis
- Seleção de serviços e profissionais
- Confirmação e cancelamento de agendamentos
- Lembretes automáticos

---

### Tecnologias Utilizadas

- **Backend**: Django, Django REST Framework
- **Tarefas Assíncronas**: Celery, Redis
- **Banco de Dados**: PostgreSQL (se possível, DigitalOcean)
- **Integração com LLM**: DeepInfra (usando Meta-Llama)
- **API de Mensagens**: WhatsApp API para comunicação
- **Deploy**: Digital Ocean com Docker e EasyPanel e/ou App Platform

---

### Área Administrativa (Staff)

- [x] Dashboard Administrativo
- [x] Gerenciamento de Usuários
- [x] Gerenciamento de Salões
- [x] Detalhes do Salão
- [x] Gerenciamento de Planos
- [x] Monitoramento WhatsApp
- [x] Suporte Técnico
- [x] Status WhatsApp
- [ ] Financeiro (em desenvolvimento)
- [ ] Gerenciamento de Equipe Staff
- [ ] Monitoramento de Infraestrutura
  - Métricas de VMs/Droplets
  - Consumo por salão
  - Métricas do Bot 1 (IA Suporte/Vendas)
  - Status dos serviços
  - Logs do sistema

### Área do Salão (Owner)

- [x] Dashboard do Salão
- [x] Calendário de Agendamentos
- [x] Gerenciamento de Profissionais
- [x] Gerenciamento de Serviços
- [x] Configurações
- [x] Configurações WhatsApp
- [x] Gerenciamento de Clientes
- [ ] Relatórios (pendente)

### Área do Profissional (Professional) - Em Desenvolvimento

- [x] Login por telefone (integrado na página de login principal)
- [x] Agenda Pessoal
- [x] Gerenciamento de Clientes
- [x] Histórico de Atendimentos
- [ ] Perfil e Configurações

### Autenticação e Onboarding

- [x] Login (Email/Telefone - só para os profissionais)
- [x] Registro
- [x] Onboarding Flow
- [x] Página de Planos

### Funcionalidades implementadas

- [x] Autenticação (Email, Telefone, Google, Facebook)
- [x] Dashboard com estatísticas
- [x] Calendário de Agendamentos
- [x] Gestão de Serviços
- [x] Gestão de Profissionais
- [x] Integração WhatsApp
- [x] Tarefas automáticas (lembretes, mensagens pós-atendimento)

## Integrações

### WhatsApp (Evolution API)

- Versão: v2
- Documentação: https://doc.evolution-api.com/v2/pt/get-started/introduction
- Status: Parcialmente implementada
  - [x] Configuração básica
  - [ ] Envio de mensagens
  - [ ] QR Code e conexão de instância
  - [ ] Webhooks para status da conexão

### Deep Infra (LLM)

- Modelo: Meta-Llama-3-8B-Instruct
- Status: Implementado
  - [x] Bot 1 (Atendimento ao Salão)
  - [x] Bot 2 (Atendimento ao Cliente)
  - [ ] Testes e ajustes de prompts

## Páginas do Sistema

### Área Pública

- [x] Landing Page
- [x] Página de Planos
- [x] Login
- [x] Registro

### Área do Salão (Owner)

- [x] Dashboard
- [x] Calendário
- [x] Gerenciamento de Profissionais
- [x] Gerenciamento de Serviços
- [x] Configurações
- [ ] Conexão WhatsApp (Prioritário)
- [ ] Gerenciamento de Clientes
- [ ] Relatórios
- [ ] Perfil e Plano

### Área Administrativa (Staff)

- [x] Dashboard
- [x] Gerenciamento de Salões
- [x] Gerenciamento de Planos
- [ ] Gerenciamento de Equipe Staff
- [ ] Financeiro
- [ ] Relatórios Administrativos

## Próximos Passos (Priorizado)

1. ~~Área do Profissional (Prioridade atual)~~
   ~~- Implementar login por telefone ~~
   ~~- Criar visualização de agenda pessoal~~
   ~~- Desenvolver gerenciamento de clientes próprios~~
   ~~- Sistema de histórico de atendimentos~~

2. ~~Gerenciamento de Clientes~~
   ~~- Cadastro e edição de clientes~~
   ~~- Criar CRUD completo~~
   ~~- Implementar ajustes no modelo~~
   ~~- Histórico de agendamentos por cliente~~
   ~~- Preferências e observações~~
   ~~- Integração com WhatsApp~~

3. Implementar página de conexão WhatsApp

   - Interface para leitura do QR Code gerado pela Evolution Api (não está funcionando)
     ~~- Criar instância na Evolution Api ao criar o salão (tanto via painel da staff quanto via registro e pagamento)~~
   - Monitoramento do status da conexão (está com falha)
   - Logs de eventos

4. Desenvolver área de relatórios
   Para Staff e Salões:

   - Dashboard analítico
   - Exportação de dados
   - Métricas por período
     Para Staff:
   - Monitoramento de recursos (VMs/Droplets)
   - Métricas de uso do Bot 1
   - Status dos serviços
   - Logs centralizados (a depender do log, vale mais a pena na página do TI (TechSupport))
     Para Salões:
   - Métricas de uso do Bot 2

5. ~~Finalizar gestão de equipe staff~~
   ~~- Permissões personalizadas~~
   ~~- Logs de atividades~~
   ~~- Métricas de desempenho~~

6. Melhorias Gerais
   - Tratar erros
   - Verificar conexões das páginas
     - Financeiro
     - Settings
     - Profile
   - Fazer o deploy do sistema na Digital Ocean e mudar infra para núvem (Dabco de dados, etc)
   - Criar uma base de dados integrada dos profissionais caso venha existir profissionais em mais de um salão
     ~~- Internacionalização e tradução com os arquivos Locales~~
     ~~ - Atualizar arquivos locales~~
   - Aprimorar sistema de permissões
   - Refinar interface do usuário
   - Otimizar fluxos de navegação

## Funcionalidades Principais

### Integração WhatsApp

- Conexão via QR Code ou código (em desenvolvimento)
- Integração com Evolution API
- Status de conexão em tempo real
- Envio automático de mensagens
- Bots de atendimento personalizados

### Gerenciamento de Salão

- Cadastro de profissionais
- Agenda de serviços
- Relatórios automáticos
- Gestão de clientes