# Páginas Administrativas

Esta pasta contém as páginas específicas para a área administrativa do sistema.

## Estrutura

```
admin/
├── Dashboard.tsx         # Dashboard administrativo
├── Plans.tsx            # Gerenciamento de planos
├── Reports.tsx          # Relatórios e análises
├── SalonForm.tsx        # Formulário de salão
├── SalonsManagement.tsx # Gestão de salões
├── SalonUsers.tsx       # Gestão de usuários do salão
└── Support.tsx          # Sistema de suporte
```

## Páginas

### Dashboard (`Dashboard.tsx`)

Painel principal administrativo:

- Métricas gerais do sistema
- Salões ativos/inativos
- Novos registros
- Alertas e notificações importantes

### Planos (`Plans.tsx`)

Gerenciamento de planos de assinatura:

- Lista de planos disponíveis
- Criação/edição de planos
- Definição de recursos e limites
- Histórico de alterações

### Relatórios (`Reports.tsx`)

Sistema de relatórios administrativos:

- Métricas de uso
- Análise de receita
- Estatísticas de usuários
- Relatórios customizados
- Exportação de dados

### Gestão de Salões (`SalonsManagement.tsx`)

Gerenciamento completo de salões:

- Listagem de salões
- Status de assinaturas
- Ações administrativas
- Histórico de alterações

### Usuários do Salão (`SalonUsers.tsx`)

Gestão de usuários por salão:

- Lista de usuários
- Permissões e papéis
- Status de acesso
- Histórico de atividades

### Suporte (`Support.tsx`)

Central de suporte:

- Tickets de suporte
- FAQ administrativo
- Logs de sistema
- Ferramentas de diagnóstico

## Integração com Layout

Todas as páginas utilizam o `AdminLayout` que fornece:

- Menu lateral de navegação
- Header com informações do admin
- Breadcrumbs de navegação
- Área de notificações

## Estado Global

As páginas utilizam os seguintes contextos:

- `AdminAuthContext`: Autenticação administrativa
- `NotificationContext`: Sistema de notificações
- Outros contextos específicos por funcionalidade

## Padrões de Implementação

1. **Estrutura de Página**:
   - Header com título e ações principais
   - Área de filtros quando necessário
   - Conteúdo principal
   - Feedback de loading/erro
2. **Dados e Cache**:
   - Caching de dados frequentes
   - Polling para dados críticos
   - Paginação para listas grandes
   - Busca e filtros otimizados
3. **Feedback Visual**:
   - Loading states
   - Mensagens de erro
   - Confirmações de ação
   - Tooltips informativos
4. **Responsividade**:
   - Layout adaptativo
   - Tabelas responsivas
   - Menus colapsáveis
   - Touch-friendly em mobile

## Segurança

1. **Controle de Acesso**:
   - Verificação de permissões
   - Proteção de rotas
   - Validação de tokens
   - Logs de ações críticas
2. **Validação de Dados**:
   - Validação no cliente
   - Sanitização de inputs
   - Prevenção de XSS
   - Rate limiting

## Melhorias Futuras

1. **Performance**:
   - Implementar virtualização em listas grandes
   - Otimizar queries de relatórios
   - Melhorar caching de dados
2. **UX/UI**:
   - Adicionar mais filtros avançados
   - Melhorar visualização de dados
   - Implementar mais gráficos interativos
   - Adicionar exportação em mais formatos
