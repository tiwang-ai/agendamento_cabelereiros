# Componentes de UI

Esta pasta contém componentes básicos de interface do usuário que formam os blocos fundamentais do design system.

## Estrutura

```
ui/
├── Alert/            # Componentes de alerta e notificação
├── Avatar/           # Componentes de avatar e imagem de perfil
├── Badge/            # Badges e indicadores
├── Calendar/         # Componentes de calendário e data
├── Dialog/           # Modais e diálogos
├── Dropdown/         # Menus dropdown
├── Input/            # Campos de entrada
├── Select/           # Campos de seleção
└── Table/            # Tabelas e listagens
```

## Componentes

### Alert

Sistema de alertas e notificações:

- Diferentes tipos (success, error, warning, info)
- Animações de entrada/saída
- Opção de auto-dismiss
- Ações customizáveis

### Avatar

Componente de avatar:

- Suporte a imagens
- Fallback com iniciais
- Diferentes tamanhos
- Indicador de status

### Badge

Badges e indicadores:

- Contadores numéricos
- Indicadores de status
- Posicionamento flexível
- Variações de cor

### Calendar

Componentes relacionados a datas:

- Seletor de data
- Visualização de mês
- Range de datas
- Horários disponíveis

### Dialog

Sistema de modais:

- Diferentes tamanhos
- Animações suaves
- Gestão de foco
- Ações de confirmação

### Dropdown

Menus dropdown:

- Posicionamento automático
- Suporte a submenus
- Navegação por teclado
- Itens customizáveis

### Input

Campos de entrada:

- Text, number, email, etc
- Validação visual
- Estados de erro
- Máscaras e formatação

### Select

Campos de seleção:

- Single e multiple select
- Busca e filtro
- Opções agrupadas
- Loading states

### Table

Componentes de tabela:

- Ordenação
- Paginação
- Seleção de linhas
- Filtros customizados

## Padrões de Design

1. **Consistência**:
   - Cores do tema
   - Tipografia
   - Espaçamento
   - Interações
2. **Estados**:
   - Hover
   - Focus
   - Active
   - Disabled
   - Loading
   - Error
3. **Animações**:
   - Transições suaves
   - Feedback visual
   - Micro-interações
   - Performance otimizada

## Acessibilidade

1. **Interação**:
   - Suporte a teclado
   - Focus management
   - ARIA labels
   - Role attributes
2. **Visual**:
   - Contraste adequado
   - Tamanhos de texto
   - Espaçamento legível
   - Estados visíveis

## Uso dos Componentes

1. **Importação**:
   ```tsx
   import { Button } from '@/components/ui/Button'
   import { Input } from '@/components/ui/Input'
   ```
2. **Props Consistentes**:
   - `size`: 'sm' | 'md' | 'lg'
   - `variant`: 'primary' | 'secondary' | 'outline'
   - `disabled`: boolean
   - `loading`: boolean
3. **Composição**:
   ```tsx
   <Dialog>
     <Dialog.Header>Título</Dialog.Header>
     <Dialog.Content>
       <Input />
       <Select />
     </Dialog.Content>
     <Dialog.Footer>
       <Button>Confirmar</Button>
     </Dialog.Footer>
   </Dialog>
   ```

## Manutenção

1. **Versionamento**:
   - Mudanças documentadas
   - Breaking changes sinalizados
   - Migrations guides
   - Backwards compatibility
2. **Performance**:
   - Bundle size otimizado
   - Code splitting
   - Lazy loading
   - Memoização
3. **Testes**:
   - Unit tests
   - Integration tests
   - Visual regression
   - Accessibility tests
