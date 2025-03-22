# Contextos React - Gerenciamento de Estado Global

## Visão Geral

A pasta `contexts` contém todos os contextos React utilizados para gerenciamento de estado global da aplicação. Esta abordagem permite compartilhar dados entre componentes sem precisar passar props manualmente através da árvore de componentes.

## Arquivos Principais
### `AppProviders.tsx`
Este arquivo centraliza todos os provedores de contexto da aplicação, simplificando a estrutura do componente raiz.

### `AuthContext.tsx`
Gerencia o estado de autenticação global da aplicação:
- Armazena informações do usuário autenticado
- Fornece funções para login, logout e refresh de tokens
- Verifica automaticamente a autenticação ao iniciar a aplicação

### `AdminAuthContext.tsx`
Contexto especializado para autenticação na área administrativa:
- Estende as funcionalidades do `AuthContext` com permissões específicas para administradores
- Fornece verificações de permissões baseadas em roles
- Implementa redirecionamentos específicos para área administrativa


## Padrão de Implementação de Contextos
### Estrutura Padrão de um Contexto
Cada contexto segue uma estrutura consistente:
1. **Definição de Tipos**: Interfaces para dados e props
2. **Criação do Contexto**: Usando `createContext`
3. **Componente Provider**: Implementa a lógica do contexto
4. **Hook Personalizado**: Para acesso simplificado ao contexto

## Interação com Serviços
Os contextos geralmente interagem com serviços para operações de API

## Relacionamento entre Contextos
É possível que contextos dependam uns dos outros. Nestes casos
- O contexto dependente deve ser aninhado dentro do contexto do qual depende
- Use hooks de contextos "pais" dentro dos provedores "filhos"

## Boas Práticas
1. **Separação de Responsabilidades**: Cada contexto deve ter uma responsabilidade clara
2. **Memoização**: Use `useMemo` e `useCallback` para evitar renders desnecessários
3. **Tipos Explícitos**: Defina interfaces claras para os dados do contexto
4. **Tratamento de Erros**: Implemente tratamento consistente de erros de API
5. **Feedback de Loading**: Exponha estados de loading para melhorar UX

## Contextos Planejados
Além dos existentes, os seguintes contextos podem ser implementados:

- **AppointmentContext**: Gerenciar estado de agendamentos
- **ServicesContext**: Gerenciar estado de serviços
- **NotificationContext**: Gerenciar notificações e toasts
- **ThemeContext**: Para eventual suporte a temas/dark mode
