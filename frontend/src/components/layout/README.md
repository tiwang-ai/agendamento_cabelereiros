# Componentes de Layout

Esta pasta contém os componentes responsáveis pela estrutura e organização do layout da aplicação.

## Estrutura

```
layout/
├── AdminLayout.tsx    # Layout principal da área administrativa
├── ClientLayout.tsx   # Layout principal da área do salão
└── PrivateRoute.tsx   # Componente de proteção de rotas
```

## Componentes

### AdminLayout

Layout principal para área administrativa:

- Barra lateral de navegação
- Header com informações do usuário
- Menu de navegação principal
- Área de conteúdo principal
- Responsividade mobile/desktop
- Gerenciamento de estado do menu (expandido/recolhido)
  **Recursos**:
- Navegação intuitiva
- Breadcrumbs
- Feedback visual da rota atual
- Perfil do usuário
- Botão de logout
- Notificações do sistema

### ClientLayout

Layout específico para área do salão:

- Header com informações do salão
- Menu de navegação contextual
- Área de conteúdo adaptativa
- Rodapé com informações de contato
  **Recursos**:
- Acesso rápido a funções comuns
- Indicadores de status
- Área de notificações
- Menu responsivo
- Informações do plano atual

### PrivateRoute

Componente de proteção de rotas:

- Verificação de autenticação
- Redirecionamento para login
- Verificação de permissões
- Preservação da rota pretendida

## Padrões de Layout

1. **Estrutura**:
   - Grid system consistente
   - Containers padronizados
   - Breakpoints definidos
   - Margens e padding uniformes
2. **Navegação**:
   - Hierarquia clara
   - Feedback visual
   - Transições suaves
   - Breadcrumbs quando necessário
3. **Responsividade**:
   - Layout fluido
   - Menus adaptáveis
   - Conteúdo priorizado
   - Touch-friendly em mobile
4. **Performance**:
   - Code splitting por rota
   - Lazy loading de componentes
   - Otimização de re-renders
   - Caching de dados quando possível

## Integração com Temas

Os layouts suportam temas claros e escuros:

1. **Cores**:
   - Backgrounds adaptáveis
   - Texto com contraste adequado
   - Elementos de UI consistentes
   - Transições suaves entre temas
2. **Componentes**:
   - Estilização consistente
   - Adaptação automática ao tema
   - Manutenção da identidade visual
   - Acessibilidade preservada

## Boas Práticas

1. **Organização**:
   - Componentes modulares
   - Reutilização de código
   - Separação de responsabilidades
   - Nomenclatura clara
2. **Acessibilidade**:
   - Landmarks semânticos
   - Skip links
   - Foco gerenciado
   - ARIA roles apropriados
3. **Manutenção**:
   - Código documentado
   - Componentes testáveis
   - Props tipadas
   - Erros tratados adequadamente
