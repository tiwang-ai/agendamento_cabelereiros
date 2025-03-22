# Componentes Comuns

Esta pasta contém componentes compartilhados que são utilizados em múltiplas áreas do sistema.

## Estrutura

```
common/
├── Button/           # Botões padronizados
├── Form/            # Componentes de formulário
├── Layout/          # Componentes de layout
└── Loading/         # Indicadores de carregamento
```

## Componentes

### Button

Coleção de botões padronizados:

- Botões primários e secundários
- Botões de ação (submit, cancel)
- Botões com ícones
- Botões de loading

### Form

Componentes reutilizáveis de formulário:

- Inputs padronizados
- Select customizado
- Checkbox e Radio
- Máscaras de input (telefone, data)
- Validação visual

### Layout

Componentes estruturais:

- Cards
- Containers
- Grids
- Dividers
- Spacing

### Loading

Indicadores de carregamento:

- Spinners
- Skeletons
- Progress bars
- Loading overlays

## Padrões de Uso

1. **Consistência Visual**
   - Cores do tema
   - Tipografia padrão
   - Espaçamentos consistentes
   - Animações suaves
2. **Acessibilidade**
   - Contraste adequado
   - Estados de foco
   - Suporte a teclado
   - ARIA labels
3. **Responsividade**
   - Mobile-first
   - Breakpoints padrão
   - Flexbox/Grid layouts
   - Adaptação de conteúdo
4. **Performance**
   - Code splitting
   - Lazy loading
   - Memoização quando necessário
   - Otimização de re-renders

## Guia de Contribuição

Ao adicionar novos componentes comuns:

1. Mantenha a consistência com os padrões existentes
2. Documente props e exemplos de uso
3. Considere a reutilização em diferentes contextos
4. Teste em diferentes resoluções
5. Garanta acessibilidade

## Integração com Design System

Os componentes desta pasta seguem o design system do projeto:

1. **Cores**
   - Primárias: `primary-{shade}`
   - Secundárias: `secondary-{shade}`
   - Estados: success, error, warning, info
2. **Tipografia**
   - Família: Inter
   - Tamanhos: text-xs até text-2xl
   - Pesos: normal, medium, semibold, bold
3. **Espaçamento**
   - Grid de 4px (0.25rem)
   - Classes utilitárias do Tailwind
   - Margens e paddings consistentes
