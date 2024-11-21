# Sistema de Agendamento para Salão de Beleza

## Descrição
Este projeto fornece um sistema de agendamento e atendimento via WhatsApp para salões de beleza e barbearias, com integração de uma LLM para comunicação automatizada. Ele permite a configuração de dois bots: um para atender o salão cliente (Bot 1) e outro para atender os clientes finais do salão (Bot 2).

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
│   ├── views.py               # Views principais, incluindo o processamento de perguntas para os bots
│   ├── models.py              # Modelos do banco de dados (Salão, Agendamento, etc.)
│   ├── urls.py                # Definição das rotas da API
│   ├── filters.py             # Filtros específicos para cada bot
│   ├── llm_utils.py           # Funções de integração com a LLM (prompt engineering, chamada API)
│   ├── serializers.py         # Serializers para conversão dos modelos para JSON
│   ├── tasks.py               # Tarefas assíncronas com Celery (ex: relatórios automáticos)
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
│   │   └── ...
│   ├── landing/
│   │   ├── components/
│   │   │   └── Demo/
│   │   │   │   ├── BookingFlow.tsx
│   │   │   │   ├── CalendarPreview.tsx
│   │   │   │   ├── ServiceSelection.tsx
│   │   │   │   └── BookingConfirmation.tsx
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
│   │   │   │   └── Plans.tsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── SalonDashboard.tsx
│   │   │   ├── management/
│   │   │   │   ├── Professionals.tsx
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
│   │   │   ├── settings/
│   │   │   │   └── Settings.tsx
│   │   │   └── plans/
│   │   │       └── PricingPage.tsx
│   │   ├── services/      # Serviços de API
│   │   │   ├── payment.ts
│   │   │   ├── auth.ts
│   │   │   ├── plans.ts
│   │   │   ├── finance.ts
│   │   │   ├── salons.ts
│   │   │   ├── users.ts
│   │   │   └── api.ts
│   │   ├── hooks/         # Custom hooks
│   │   │   └── usePermissions.ts
│   │   ├── contexts/      # Contextos React
│   │   │   └── AuthContext.tsx
│   │   ├── types/         # Tipos/Interfaces
│   │   │   └── auth.ts
│   │   ├── utils/         # Funções utilitárias
│   │   ├── assets/        # Imagens, etc
│   │   │   └── react.svg
│   │   ├── theme.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── vite.config.js
├── README.md                  # Documentação do projeto
├── requirements.txt           # Dependências do projeto
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
    horario_funcionamento
    telefone
}

-- Tabela Profissionais
Profissionais {
    id (PK)
    estabelecimento_id (FK)
    nome
    especialidade
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
    nome
    whatsapp
    historico_agendamentos
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

Relacionamentos:
- Estabelecimentos 1:N Profissionais
- Estabelecimentos 1:N Servicos
- Estabelecimentos 1:1 Calendario_Estabelecimento
- Profissionais 1:N Horarios_Disponiveis
- Profissionais 1:N Agendamentos
- Servicos 1:N Agendamentos
- Clientes 1:N Agendamentos

---

## Funcionalidades

1. **Bot 1 (Atendimento ao Salão Cliente)**:
   - Responde a perguntas administrativas dos salões, como status de agendamentos e relatórios.
   - Envia relatórios automáticos de desempenho.

2. **Bot 2 (Atendimento ao Cliente Final do Salão)**:
   - Responde a perguntas sobre agendamentos, tipos de serviços e horários disponíveis.
   - Gerencia agendamentos dos clientes finais.

3. **Integração com WhatsApp**:
   - Sistema de comunicação via API para atender e interagir com os clientes pelo WhatsApp.

4. **Gerenciamento de Agendamentos**:
   - Sistema de calendário para armazenar e organizar agendamentos de cada salão.

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
- [ ] Financeiro (pendente)

### Área do Salão (Owner)
- [x] Dashboard do Salão
- [x] Calendário de Agendamentos
- [x] Gerenciamento de Profissionais
- [x] Gerenciamento de Serviços
- [x] Configurações
- [ ] Relatórios (pendente)

### Autenticação e Onboarding
- [x] Login
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

## Próximos Passos
1. [ ] Implementar página de conexão WhatsApp
2. [ ] Desenvolver área de relatórios
3. [ ] Finalizar gestão de equipe staff
4. [ ] Melhorar UX do onboarding
5. [ ] Implementar testes E2E