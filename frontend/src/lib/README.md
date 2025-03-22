# Bibliotecas e Utilitários

## Visão Geral

A pasta `lib` contém configurações, utilitários e integrações com bibliotecas externas que são utilizados em toda a aplicação. Estes arquivos fornecem funcionalidades compartilhadas e configurações centralizadas para manter a consistência e facilitar a manutenção.

## Arquivos Principais

### `axios.ts`

Configuração centralizada do cliente HTTP Axios para comunicação com a API backend:

- Configuração de URL base
- Interceptadores para autenticação
- Refresh automático de tokens
- Tratamento padronizado de erros

### `database.types.ts`

Define tipos TypeScript para a integração com o Supabase:

- Tipos para tabelas do banco de dados
- Tipos para relacionamentos
- Tipos para retornos de queries

### `storage.ts`

Utilitários para manipulação de armazenamento (arquivos e imagens):

- Upload de imagens para o Supabase Storage
- Geração de URLs públicas ou privadas
- Exclusão de arquivos

## Utilitários Comuns

### Formatação

### Validação

### Manipulação de URL

## Integrações Planejadas

Além dos utilitários existentes, os seguintes estão planejados:

1. **debounce.ts**: Utilitários para debounce e throttle de funções
2. **analytics.ts**: Integração com ferramentas de analytics
3. **notify.ts**: Sistema de notificações toast
4. **theme.ts**: Gerenciamento de temas
5. **localCache.ts**: Cache local para dados frequentemente acessados
