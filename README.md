# Sistema de Agendamento para Salão de Beleza

## Descrição
Sistema completo para gerenciamento de salões de beleza com integração WhatsApp e IA.

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
│   │   │   │   └── OnboardingFlow.tsx
│   │   │   ├── settings/
│   │   │   │   └── Settings.tsx
│   │   │   └── plans/
│   │   │       └── PricingPage.tsx
│   │   ├── services/      # Serviços de API
│   │   │   ├── payment.ts
│   │   │   ├── auth.ts
│   │   │   ├── plans.ts
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
![image](estrutura_bd.jpeg)
### Transcrição do Banco de Dados
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

## Projeto de Agendamento para Salões de Beleza e Barbearias

Este projeto fornece um sistema de agendamento e atendimento via WhatsApp para salões de beleza e barbearias, com integração de uma LLM para comunicação automatizada. Ele permite a configuração de dois bots: um para atender o salão cliente (Bot 1) e outro para atender os clientes finais do salão (Bot 2).

---

### Funcionalidades

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

### Instalação e Configuração

1. **Clone o Repositório**:
   ```bash
   git clone https://github.com/seu-usuario/projeto-agendamento-salao.git
   cd projeto-agendamento-salao
   ```

2. **Crie um Ambiente Virtual e Instale as Dependências**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   ```

3. **Configuração do Banco de Dados**:
   - Configure o PostgreSQL e adicione as variáveis de conexão no arquivo `.env`.

4. **Configuração do Redis para o Celery**:
   - Configure o Redis para tarefas assíncronas.

5. **Configuração das Variáveis de Ambiente**:
   - Crie um arquivo `.env` com as variáveis necessárias:
     ```
     DEEPINFRA_API_KEY=suachave
     DATABASE_URL=postgres://usuario:senha@localhost:5432/nome_do_banco
     REDIS_URL=redis://localhost:6379/0
     ```

6. **Executar Migrações do Banco de Dados**:
   ```bash
   python manage.py migrate
   ```

7. **Iniciar o Servidor**:
   ```bash
   python manage.py runserver
   ```

---

### Estrutura da API

#### Endpoints Principais

1. **Bot 1 - Atendimento ao Salão Cliente**
   - `POST /api/bot1/pergunta`: Enviar perguntas administrativas sobre relatórios e status do sistema.

2. **Bot 2 - Atendimento ao Cliente Final**
   - `POST /api/bot2/pergunta`: Enviar perguntas de clientes sobre serviços, agendamentos e disponibilidade.

3. **Relatórios Automáticos**
   - Tarefas automáticas configuradas com Celery para enviar relatórios semanais.

---

### Estrutura do Banco de Dados 

![image](https://github.com/user-attachments/assets/ef6d56a1-eea9-4d78-933e-d864b687c033)


### Exemplo de Código e Prompt Engineering

Para cada bot, utilizamos **Prompt Engineering** para personalizar o comportamento. Exemplos de prompts para cada bot estão implementados em `llm_utils.py`.

```python
def gerar_prompt_bot1(pergunta):
    prompt = f"""
    Você é um bot de atendimento ao cliente da empresa que fornece o sistema de agendamento para salões. Responda apenas a perguntas sobre relatórios, configuração do sistema e status de agendamentos.
    Pergunta: {pergunta}
    """
    return prompt
```

---

### Tarefas Assíncronas com Celery

As tarefas assíncronas são usadas para relatórios automáticos e outros processos em segundo plano.

Configuração no arquivo `celery.py`:

```python
from celery import Celery
from django.conf import settings

app = Celery('projeto')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

---

### Variáveis de Ambiente Necessárias

Para a execução correta do projeto, algumas variáveis de ambiente devem estar configuradas:

- `DEEPINFRA_API_KEY`: Chave de acesso para a API do DeepInfra.
- `DATABASE_URL`: URL de conexão com o PostgreSQL.
- `REDIS_URL`: URL de conexão com o Redis.
- Outras variáveis para configuração da API do WhatsApp, se aplicável.

---

### Como Contribuir

1. Faça um fork do repositório.
2. Crie uma branch para a sua feature (`git checkout -b feature/nova-feature`).
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`).
4. Faça push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.


---

### Próximos Passos
1. **Frontend do Projeto**
2. **Configuração Completa do WhatsApp API**: Finalizar a integração com o WhatsApp para os dois bots.
3. **Refinamento do Prompt Engineering**: Ajustar os prompts com base no feedback do usuário.
4. **Documentação dos Endpoints e Testes Automatizados**: Expandir a documentação da API e adicionar testes.

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

## Funcionalidades implementadas
- [x] Autenticação (Email, Telefone, Google, Facebook)
- [x] Dashboard com estatísticas
- [x] Calendário de Agendamentos
- [x] Gestão de Serviços
- [x] Gestão de Profissionais
- [x] Integração WhatsApp
- [x] Tarefas automáticas (lembretes, mensagens pós-atendimento)

## Próximos Passos
1. Implementar página de Financeiro (admin)
2. Implementar página de Relatórios (owner)
3. Melhorar integração com WhatsApp
4. Implementar sistema de notificações
5. Adicionar mais métricas no dashboard