# Serviços de API - Comunicação com Backend
## Visão Geral
A pasta `services` contém todos os serviços responsáveis pela comunicação com APIs externas, principalmente o backend Django e a Evolution API para WhatsApp. Estes serviços encapsulam a lógica de requisições HTTP, permitindo que componentes e contextos interajam com APIs de forma limpa e organizada.

## Arquivos Principais
### `auth.ts`
Gerencia todos os serviços relacionados à autenticação:
- Login e registro de usuários
- Obtenção e refresh de tokens JWT
- Logout
- Acesso a dados de perfil

### `whatsapp.ts`
Implementa a comunicação com a Evolution API para funcionalidades de WhatsApp:
- Obtenção de status de conexão
- Geração de QR Code para autenticação
- Envio de mensagens
- Configuração de webhooks
- Gestão de logs

## Arquitetura de Serviços
### Comunicação com o Backend
Os serviços utilizam a configuração centralizada de Axios em `/lib/axios.ts`, que:
1. Configura a URL base do backend
2. Adiciona automaticamente tokens de autenticação
3. Implementa refresh automático de tokens
4. Padroniza o tratamento de erros

### Comunicação com Evolution API (WhatsApp)
Para a comunicação com a Evolution API, uma instância separada do Axios é configurada


## Padrão de Implementação de Serviços
### Abordagem Funcional


### Abordagem de Objeto de Serviço


## Tratamento de Erros
Os serviços implementam padrões consistentes de tratamento de erros

## Mapeamento para o Backend
A tabela abaixo relaciona os serviços do frontend com os endpoints correspondentes no backend:

| Serviço Frontend                        | Endpoint Backend                 | Método | Descrição                  |
| --------------------------------------- | -------------------------------- | ------ | -------------------------- |
| `auth.login()`                          | `/api/auth/login/`               | POST   | Autenticação de usuário    |
| `auth.register()`                       | `/api/auth/register/`            | POST   | Registro de novo usuário   |
| `auth.refreshToken()`                   | `/api/auth/refresh/`             | POST   | Atualização de token       |
| `auth.getProfile()`                     | `/api/auth/profile/`             | GET    | Obtenção de perfil         |
| `whatsappService.getConnectionStatus()` | `/instance/connectionState/{id}` | GET    | Status de conexão WhatsApp |
| `whatsappService.setWebhook()`          | `/instance/webhook/{id}`         | POST   | Configuração de webhook    |

## Serviços Planejados
Além dos serviços existentes, os seguintes serviços precisarão ser implementados:
- **clients.ts**: Gerenciamento de clientes
- **professionals.ts**: Gerenciamento de profissionais
- **services.ts**: Gerenciamento de serviços oferecidos
- **appointments.ts**: Gerenciamento de agendamentos
- **reports.ts**: Obtenção de relatórios e estatísticas
- **salon.ts**: Configurações de salão/estabelecimento

## Boas Práticas
1. **Tipagem Estrita**: Definir interfaces para todos os dados de entrada e saída
2. **Tratamento de Erros**: Implementar try/catch consistente
3. **Abstração**: Isolar lógica de API dos componentes
4. **Reutilização**: Evitar código duplicado entre serviços
5. **Documentação**: Manter comentários explicativos para operações complexas
