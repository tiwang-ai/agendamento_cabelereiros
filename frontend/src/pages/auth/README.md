# Páginas de Autenticação

Esta pasta contém as páginas relacionadas à autenticação e registro de usuários.

## Estrutura

```
auth/
├── Login.tsx    # Página de login
└── Register.tsx # Página de registro
```

## Páginas

### Login (`Login.tsx`)

Página de autenticação principal:

- Formulário de login
- Validação de credenciais
- Recuperação de senha
- Redirecionamento inteligente
- Persistência de sessão

**Funcionalidades**:

- Login com email/senha
- Remember me
- Feedback de erros
- Loading states
- Proteção contra múltiplos envios

### Registro (`Register.tsx`)

Página de registro de novos usuários:

- Formulário de cadastro
- Validação em tempo real
- Termos de uso
- Confirmação de email
- Criação de perfil inicial

**Campos**:

- Nome completo
- Email
- Senha
- Confirmação de senha
- Tipo de usuário
- Aceitação de termos

## Integração com Autenticação

1. **Contextos**:
   - `AuthContext`: Gerenciamento de estado de autenticação
   - `AdminAuthContext`: Autenticação administrativa
2. **Serviços**:
   - `auth.ts`: Serviços de autenticação
   - `mockAuth.ts`: Dados mockados para desenvolvimento

## Fluxos de Autenticação

### Login

1. Usuário insere credenciais
2. Validação no cliente
3. Envio para API
4. Armazenamento de tokens
5. Redirecionamento baseado em role

### Registro

1. Preenchimento do formulário
2. Validação em tempo real
3. Envio para API
4. Confirmação de email
5. Redirecionamento para setup inicial

## Segurança

1. **Proteções**:
   - Rate limiting
   - CSRF tokens
   - Validação de força de senha
   - Proteção contra bots
2. **Validações**:
   - Email válido
   - Senha forte
   - Campos obrigatórios
   - Dados sanitizados

## UX/UI

1. **Feedback Visual**:
   - Indicadores de força de senha
   - Loading states
   - Mensagens de erro claras
   - Confirmações de sucesso
2. **Acessibilidade**:
   - Labels semânticos
   - Mensagens de erro para screen readers
   - Navegação por teclado
   - Contraste adequado

## Melhorias Planejadas

1. **Autenticação**:
   - Login social (Google, Facebook)
   - Autenticação em dois fatores
   - Login com WhatsApp
   - SSO para empresas
2. **UX**:
   - Onboarding melhorado
   - Tour guiado pós-registro
   - Formulários multi-step
   - Recuperação de senha mais intuitiva
3. **Segurança**:
   - Captcha em tentativas repetidas
   - Bloqueio temporário após falhas
   - Notificações de login suspeito
   - Registro de dispositivos confiáveis
