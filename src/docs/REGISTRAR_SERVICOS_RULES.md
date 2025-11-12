# Funcionalidade: Registrar Novo Serviço (`Services.Create`)

Esta funcionalidade permite a criação de um novo serviço oferecido por um salão. Um serviço pertence a um salão (`salon`) e pode ter regras de quais papéis (`roles`) podem executá-lo (via pivot `service_roles`).

## 1. Endpoint da API

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **POST** | `/api/salons/:salonId/services` | Cria um novo serviço no salão informado. |

## 2. Controle de Acesso e Permissões

A criação de serviços é restrita e segue as seguintes regras de autorização:

| Usuário/Role | Permissão Necessária | Descrição do Acesso |
| :--- | :--- | :--- |
| **Super Admin** (`global_role: 'super_admin'`) | Nenhuma | Acesso irrestrito: pode criar serviço em qualquer salão. |
| **Owner (do salão)** | Nenhuma | Permissão total sobre o salão: pode criar/editar serviços. |
| **Admin (do salão)** | Nenhuma | Pode criar/editar serviços. |
| **Worker (do salão)** | `services.create` (via `role_permissions`) | Só pode criar se a sua role possuir a permissão canônica `services.create`. |

Regra de autorização (implementação esperada):
- Se o usuário tem `global_role = 'super_admin'` → permitido.
- Senão, verificar `user_salon_roles` para o `salonId` requisitado:
  - Se role = `owner` ou `admin` → permitido.
  - Se role = `worker` → permitido somente se existir `role_permissions` com `permission.name = 'services.create'`.

## 3. Estrutura da Requisição (Request Body)

O corpo da requisição deve ser enviado em JSON e seguir o DTO abaixo.

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `name` | `string` | Sim | Nome do serviço (máx. 100 caracteres). Único por `salonId` (case-insensitive). |
| `description` | `string` | Não | Descrição opcional do serviço. |
| `price` | `number` (decimal) | Sim | Preço >= 0; preferir precisão DECIMAL(10,2) no BD. |
| `durationMinutes` | `integer` | Sim | Duração em minutos (> 0). |
| `isActive` | `boolean` | Não | Se o serviço está ativo (default: `true`). |
| `roleIds` | `string[] (UUID)` | Não | Lista de `roleId`s que podem executar o serviço (popula `service_roles`). |

Exemplo (DTO simplificado):

```ts
export class CreateServiceDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() description?: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price: number;
  @IsInt() @Min(1) durationMinutes: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsArray() @IsUUID('all', { each: true }) roleIds?: string[];
}
```

## 4. Regras de Validação e Negócio

- `name`: obrigatório, max 100 chars, único por `salonId` (aplicar índice/constraint DB: `UNIQUE(salon_id, lower(name))` quando possível).
- `price`: decimal com 2 casas, >= 0.
- `durationMinutes`: inteiro positivo; validar limites (ex.: <= 1440).
- `roleIds`: se fornecido, cada `roleId` deve existir; preferível validar que são papéis do catálogo (`owner`, `admin`, `worker`, `client`) ou papéis customizados aceitos.
- `salonId`: deve existir; retornar `404` se não encontrado.

Casos de borda e recomendações técnicas:
- Concorrência: use transação e trate UniqueConstraintViolation para retornar `409 Conflict` quando nome duplicado.
- Normalizar `name` ao comparar (usar `LOWER` para checagens) para evitar duplicatas case-sensitive;
- Sanitizar `description` (strip HTML) antes de persistir.

## 5. Fluxo de Criação (Passo a Passo)

1. Autenticar o usuário (Bearer JWT).
2. Autorizar conforme regras da seção 2.
3. Validar payload via DTO e regras de negócio adicionais (uniqueness, limites).
4. Iniciar transação:
   - Inserir registro na tabela `services` com `salon_id`, `name`, `description`, `price`, `duration_minutes`, `is_active`.
   - Se `roleIds` foi fornecido: validar existência dos `roleIds` e inserir linhas em `service_roles` (garantir `UNIQUE(service_id, role_id)`).
   - Commit se tudo ok; rollback se qualquer validação/inserção falhar.
5. Retornar `201 Created` com o objeto do serviço criado.

## 6. Exemplo de Request

```json
{
  "name": "Corte de Cabelo",
  "description": "Inclui lavagem e finalização",
  "price": 50.00,
  "durationMinutes": 30,
  "roleIds": ["role-worker-uuid", "role-admin-uuid"]
}
```

## 7. Exemplo de Resposta (201 Created)

```json
{
  "id": "service-uuid-1234",
  "salonId": "salon-1-uuid",
  "name": "Corte de Cabelo",
  "description": "Inclui lavagem e finalização",
  "price": 50.00,
  "durationMinutes": 30,
  "isActive": true,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

## 8. Erros e Códigos de Resposta

| Status | Código | Descrição |
| :--- | :--- | :--- |
| 400 Bad Request | `VALIDATION_ERROR` | Payload inválido (ex.: campos faltando, tipos incorretos). |
| 401 Unauthorized | `UNAUTHORIZED` | Token ausente ou inválido. |
| 403 Forbidden | `FORBIDDEN` | Usuário não tem permissão para criar serviços. |
| 404 Not Found | `SALON_NOT_FOUND` | `salonId` não existe. |
| 409 Conflict | `SERVICE_NAME_CONFLICT` | Já existe serviço com mesmo nome no salão. |

## 9. Auditoria, Logs e Eventos

- Registrar `created_by` (user id) no registro do serviço ou em tabela/log de auditoria.
- Emitir evento `service.created` (opcional) para sincronização de caches e notificações.

## 10. Regras de RBAC e Notas de Implementação

- Permissões canônicas sugeridas: `services.create`, `services.manage`.
- O `PermissionsGuard` deve considerar:
  1. `global_role = 'super_admin'` → bypass (permitir).
  2. `user_salon_roles` + `role_permissions` — verificar se a role do usuário no salão tem `services.create` quando o usuário for `worker`.
- Preferir checar permissões em cache (Redis/memory) com TTL e invalidação quando `role_permissions` ou `user_salon_roles` mudarem.

## 11. Testes Recomendados (mínimos)

- Unit:
  - `ServicesService.create()` — fluxo feliz e validações (price/duration/name).
  - Autorização: super_admin, owner/admin, worker com/sem permissão.
- Integration/E2E:
  - Criar serviço via API com `roleIds` → `201`.
  - Tentar criar serviço duplicado → `409`.
  - Worker sem permissão tenta criar → `403`.

## 12. Critérios de Aceitação

- Endpoint protegido por JWT e retorna `201` no fluxo feliz.
- Nome do serviço único por salão garantido por validação e/ou constraint DB.
- Transação garante atomicidade entre `services` e `service_roles`.

---

Observação: alinhar as seeds de permissões para incluir `services.create` e `services.manage` e mapear essas permissões para `owner`, `admin` e, se desejado, para `worker` via `role_permissions`.
## Inserir serviço do salão

Descrição: regras de negócio, validações e requisitos para criação (inserção) de um novo serviço oferecido por um salão.

Permissões e papéis permitidos
- `super_admin` (global) — tem permissão explícita para gerenciar serviços em qualquer salão.
- `owner` do salão — proprietário do salão tem permissão total para criar/editar serviços.
- `admin` do salão — administrador do salão pode criar/editar serviços.
- `worker` do salão *com permissão específica* — um usuário com papel `worker` no salão só poderá inserir serviços se o papel (role) tiver a permissão canônica `services.create` (também aceitável: alias `CREATE_SERVICE`).

Regra de autorização (implementação esperada)
- Se o usuário tiver `global_role = 'super_admin'` → permitido.
- Senão, verificar existência de `user_salon_roles` para o `salonId` requisitado:
  - Se papel é `owner` ou `admin` → permitido.
  - Se papel é `worker` → permitido somente se a role do worker tiver a permissão `services.create` atribuída via `role_permissions`.

Endpoint sugerido
- Método: POST
- URL: `/api/salons/:salonId/services`
- Autenticação: Bearer token (JWT)
- Permissões: conforme regra acima

Request body (CreateServiceDto)
```ts
export class CreateServiceDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  // Lista de roleIds que podem executar o serviço (service_roles)
  roleIds?: string[];
}
```

Regras de validação de negócio
- `name`: obrigatório, max 100 caracteres, único por `salonId` (enforce via DB UNIQUE(salon_id, lower(name)) ou checagem na aplicação).
- `price`: número decimal, >= 0.
- `durationMinutes`: inteiro positivo (> 0).
- `roleIds`: se fornecido, cada `roleId` deve existir e ser válido; preferencialmente verificá-los pertencentes ao catálogo de `roles` (owner/admin/worker/client).
- `salonId`: deve existir; retornará 404 se não for encontrado.

Fluxo de criação (passo a passo)
1. Autenticar e autorizar o usuário conforme regras acima.
2. Validar payload (DTO + regras de negócio).
3. Verificar duplicidade de `name` no salão (case-insensitive).
4. Inserir registro em `services` (salon_id, name, description, price, duration_minutes, is_active).
5. Se `roleIds` foram fornecidos:
   - Inserir registros em `service_roles` vinculando `service_id` aos `role_id` correspondentes.
   - Garantir atomicidade (usar transação): se qualquer vínculo falhar, reverter a criação do serviço.
6. Retornar `201 Created` com o objeto do serviço criado.

Exemplo de request (JSON)
```json
{
  "name": "Corte de Cabelo",
  "description": "Corte masculino e feminino - inclui lavagem",
  "price": 50.00,
  "durationMinutes": 30,
  "roleIds": ["role-worker-uuid", "role-admin-uuid"]
}
```

Exemplo de resposta (`201 Created`)
```json
{
  "id": "service-uuid-1234",
  "salonId": "salon-1-uuid",
  "name": "Corte de Cabelo",
  "description": "Corte masculino e feminino - inclui lavagem",
  "price": 50.00,
  "durationMinutes": 30,
  "isActive": true,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

Erros e códigos de resposta
- `400 Bad Request` — validação falhou (ex.: preço negativo, duração inválida, name vazio).
- `401 Unauthorized` — token ausente ou inválido.
- `403 Forbidden` — usuário não tem permissão para criar serviços (ver regras de autorização).
- `404 Not Found` — `salonId` não existe.
- `409 Conflict` — já existe um serviço com o mesmo nome no salão.

Casos de borda e recomendações técnicas
- Nome duplicado: aplicar check case-insensitive; considere normalizar com `LOWER(name)` para checagens e índice único `UNIQUE(salon_id, lower(name))` no banco (Postgres).
- Concorrência: usar transação e tratar UniqueConstraintViolation para retornar `409`.
- Preço com casas decimais: use `DECIMAL(10,2)` no DB e validação na DTO.
- Duração máxima razoável: validar limites (ex.: <= 1440 minutos) para evitar entradas inválidas.
- Sanitização de inputs: strip HTML e caracteres perigosos para `description`.

Auditoria e logs
- Registrar `created_by` (user id) no serviço ou em log de auditoria para rastreabilidade.
- Gerar evento/notification opcional (`service.created`) para sincronizar caches e front-end.

Notas sobre RBAC e permissões
- A implementação do guard deve considerar duas fontes:
  1. `global_role = 'super_admin'` — full bypass
  2. `user_salon_roles` + `role_permissions` — verificar se a role possui `services.create` antes de permitir criação por `worker`
- Permissões canônicas sugeridas: `services.create`, `services.manage` (poderá ser usado para editar/excluir).

Testes recomendados
- Unit tests:
  - `ServiceService.create()` — fluxo feliz
  - validação de DTOs (price/duration/name)
  - autorização: super_admin, owner/admin, worker com/sem permissão
- Integration/E2E:
  - criar serviço via API com roleIds
  - tentativa de criar serviço com nome duplicado → 409
  - worker sem permissão → 403

Critérios de aceitação
- Endpoint protegido por JWT e retornando `201` no fluxo feliz.
- Nome único por salão garantido por validação e/ou constraint no DB.
- Transação garante atomicidade entre `services` e `service_roles`.

Observações finais
- Se o projeto usar o sistema de permissões canônicas (dot-notation), alinhe `CREATE_SERVICE` para `services.create` nos seeds de permissões e documentação.
