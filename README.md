### Estrutura do Projeto e Organização de Pastas

Aqui está uma estrutura sugerida para organizar o projeto:

```
projeto-agendamento-salao/
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
├── frontend/                  # (Opcional) Arquivos para o frontend, se necessário
├── README.md                  # Documentação do projeto
└── .gitignore                 # Arquivo para ignorar arquivos sensíveis
```

---

### Estrutura de um README Completo

Aqui está um modelo de README que podemos ajustar conforme a necessidade.

---

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
- **Banco de Dados**: PostgreSQL
- **Integração com LLM**: DeepInfra (usando Meta-Llama)
- **API de Mensagens**: WhatsApp API para comunicação
- **Deploy**: Digital Ocean com Docker e EasyPanel

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
   source venv/bin/activate
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

### Estrutura das Pastas e Arquivos Principais

- `core/`: Lógica do projeto, incluindo views, modelos, filtros e integração com a LLM.
- `agendamento_salao/`: Configurações e arquivos principais do Django.
- `frontend/`: Diretório opcional para arquivos frontend (se houver).
- `README.md`: Documentação principal do projeto.

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
