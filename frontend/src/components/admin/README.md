# Componentes Administrativos

Esta pasta contém os componentes específicos para a área administrativa do sistema.

## Estrutura

```
admin/
├── PlanManagement.tsx       # Gerenciamento de planos de assinatura
├── SalonForm.tsx           # Formulário de criação/edição de salões
├── SalonUserForm.tsx       # Formulário de usuários do salão
├── SubscriptionDetails.tsx # Detalhes de assinatura
└── SubscriptionPlanForm.tsx # Formulário de planos de assinatura
```

## Componentes

### PlanManagement

Gerencia planos de assinatura disponíveis no sistema. Permite:

- Listagem de planos
- Criação/edição de planos
- Definição de recursos e limites
- Exclusão de planos (com validação de uso)

### SalonForm

Formulário para gestão de salões. Funcionalidades:

- Criação de novos salões
- Edição de dados existentes
- Gestão de telefones de contato
- Validações de campos obrigatórios

### SalonUserForm

Gerencia usuários vinculados a um salão. Recursos:

- Definição de permissões (admin, owner, professional, receptionist)
- Gestão de dados pessoais
- Validação de email e telefone

### SubscriptionDetails

Exibe detalhes completos de uma assinatura:

- Status atual
- Plano vigente
- Histórico de alterações
- Recursos e limites disponíveis

### SubscriptionPlanForm

Formulário de seleção/alteração de plano:

- Visualização comparativa de planos
- Seleção de novo plano
- Confirmação de alteração
- Exibição de recursos e limites

## Padrões e Convenções

1. **Formulários**
   - Uso consistente de react-hook-form
   - Validação de campos obrigatórios
   - Feedback visual de erros
   - Loading states para ações assíncronas
2. **Estado**
   - Estado local com useState para UI
   - Context API para dados compartilhados
   - Mocks temporários para dados (até integração com API)
3. **Estilização**
   - Tailwind CSS para todos os componentes
   - Classes utilitárias padronizadas
   - Responsividade em todos os formulários
4. **Acessibilidade**
   - ARIA labels em elementos interativos
   - Feedback para screen readers
   - Navegação por teclado
   - Mensagens de erro acessíveis

## Integração com API

Atualmente usando dados mockados através do `mockApi`. Planejamento para integração real:

1. Substituir chamadas mock por serviços reais
2. Implementar tratamento de erros da API
3. Adicionar cache de dados quando apropriado
4. Implementar retry em falhas de rede
