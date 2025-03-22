# Documentação de Tipos (Types)
## Visão Geral
Esta pasta contém todas as definições de tipos TypeScript usadas no projeto. Centralizar os tipos em um local dedicado facilita a manutenção, reduz duplicação e garante consistência em toda a aplicação. Os tipos são essenciais para ter um código mais seguro e para documentar a estrutura dos dados na aplicação.

## Estrutura
```
types/
├── index.ts           # Agregador que exporta todos os tipos
├── auth.ts            # Tipos relacionados à autenticação
├── salon.ts           # Tipos relacionados ao salão
├── people.ts          # Tipos de profissionais e clientes
├── appointment.ts     # Tipos de agendamento
├── whatsapp.ts        # Tipos para integração WhatsApp
└── README.md          # Esta documentação
```

## Tipos Principais
### `auth.ts`
Contém tipos relacionados à autenticação, tokens e respostas da API de autenticação:
- `UserRole`: Enum com os papéis de usuário (admin, salon_owner, professional, receptionist)
- `User`: Interface para usuário autenticado
- `AdminUser`: Interface para usuário administrador
- `AuthResponse`: Resposta da API de autenticação
- `LoginCredentials`: Credenciais para login
- `RegisterData`: Dados para registro de usuário

### `salon.ts`
Define os tipos relacionados aos salões de cabeleireiro:
- `Salon`: Interface para salão
- `Service`: Interface para serviços oferecidos
- `SalonUser`: Interface para usuários do salão
- `SalonSettings`: Configurações do salão
- `BusinessHours`: Horários de funcionamento
- `DaySchedule`: Agenda de um dia específico
- `BreakTime`: Intervalos de pausas
- `NotificationSettings`: Configurações de notificações

### `people.ts`
Define os tipos relacionados aos profissionais e clientes:
- `Professional`: Interface para profissionais
- `Client`: Interface para clientes
- `ClientHistory`: Histórico de cliente
- `ProfessionalAvailability`: Disponibilidade de profissional
- `AvailabilityException`: Exceções na disponibilidade

### `appointment.ts`
Define os tipos relacionados aos agendamentos:
- `AppointmentStatus`: Enum de status de agendamento
- `Appointment`: Interface para agendamento
- `AppointmentCreateData`: Dados para criar agendamento
- `AppointmentUpdateData`: Dados para atualizar agendamento
- `AppointmentHistory`: Histórico de alterações em agendamento
- `AvailableTimeSlot`: Horários disponíveis

### `whatsapp.ts`
Define os tipos relacionados à integração com o WhatsApp:
- `WhatsAppInstance`: Instância de conexão WhatsApp
- `WhatsAppMessage`: Mensagem de WhatsApp
- `WhatsAppWebhook`: Webhook de eventos WhatsApp
- `WhatsAppLog`: Log de eventos do WhatsApp

## Utilização de Tipos
Os tipos são utilizados em toda a aplicação para garantir a tipagem segura e documentar as estruturas de dados:

### Exemplo em Componentes
```typescript
import { Client, Professional, Service } from '@/types'

// Ou importando de arquivos específicos:
import { Client } from '@/types/people'
import { Service } from '@/types/salon'
```

### Exemplo em Serviços
```typescript
import { Appointment, AppointmentCreateData } from '@/types/appointment'

async function createAppointment(
  data: AppointmentCreateData
): Promise<Appointment> {
  // Implementação
}
```

## Boas Práticas

1. **Importe de arquivos específicos**: Para melhor organização e performance, prefira importar de arquivos específicos.
   ```typescript
   // Bom
   import { User } from '@/types/auth'

   // Evite (mas ainda funciona para compatibilidade)
   import { User } from '@/types'
   ```

2. **Mantenha as interfaces isoladas**: Cada tipo deve ter uma única responsabilidade.
3. **Use enums para valores predefinidos**: Isso garante consistência e auto-documentação.
4. **Documente campos complexos**: Adicione comentários para campos que não sejam auto-explicativos.
5. **Evite tipos `any`**: Sempre defina tipos específicos para melhor segurança e documentação.
6. **Prefira interfaces sobre types**: Use interfaces para objetos e classes, e types para união de tipos e tipos utilitários.
7. **Use tipos utilitários do TypeScript**: Aproveite `Partial<T>`, `Omit<T, K>`, `Pick<T, K>` para criar variações de tipos existentes.

## Mapeamento para Backend
Os tipos nesta pasta são mapeados para os modelos do backend Django. A consistência entre as definições de tipos do frontend e os modelos do backend é crucial para evitar problemas de integração.
| Tipo Frontend    | Modelo Backend        | Endpoint API          |
| ---------------- | --------------------- | --------------------- |
| `User`           | `CustomUser`          | `/api/users/`         |
| `Salon`          | `Salon`               | `/api/salons/`        |
| `Professional`   | `Professional`        | `/api/professionals/` |
| `Service`        | `Service`             | `/api/services/`      |
| `Client`         | `Client`              | `/api/clients/`       |
| `Appointment`    | `Appointment`         | `/api/appointments/`  |
| `WhatsAppConfig` | `WhatsAppIntegration` | `/api/whatsapp/`      |
