# Funcionalidade: Registrar Serviço de Salão (`Services.Create`)

Esta funcionalidade permite que um salão registre um novo serviço no seu catálogo (ex.: Corte de cabelo, Escova, Manicure). O serviço faz parte do catálogo do salão e pode ser relacionado a roles que estão qualificadas para executá-lo (`service_roles`).

## 1. Endpoint da API

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **POST** | `/api/salons/:salonId/services` | Cria um novo serviço para o salão especificado. |

## 2. Controle de Acesso e Permissões

A criação de serviços é controlada por RBAC e segue as regras abaixo.

| Papel / Contexto | Permissão necessária | Observações |
| :--- | :--- | :--- |
| **Super Admin** (`global_role = 'super_admin'`) | Nenhuma (acesso total) | Pode criar serviços em qualquer salão. |
| **Owner** (do salão) | Nenhuma (owner tem permissão implícita) | Proprietário do salão pode criar/editar serviços. |
| **Admin** (do salão) | Nenhuma (admin tem permissão implícita) | Administrador do salão pode criar/editar serviços. |
| **Worker** (do salão) | `services.create` (ou alias `CREATE_SERVICE`) | Worker só pode criar se sua role tiver a permissão canônica atribuída via `role_permissions`.

### Regra de autorização (implementação esperada)
- Se o usuário possuir `global_role = 'super_admin'` → permitido.
- Senão, verificar `user_salon_roles` para o `salonId`:
	- `owner` ou `admin` → permitido.
	- `worker` → permitido apenas se a role tiver `services.create` via `role_permissions`.

## 3. Estrutura da Requisição (Request Body)

O corpo da requisição deve ser enviado em JSON. Abaixo segue o DTO recomendado (`CreateServiceDto`).

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `name` | `string` | Sim | Nome do serviço (máx. 100 caracteres). Único por salão (case-insensitive). |
| `description` | `string` | Não | Descrição detalhada do serviço. |
| `price` | `number` | Sim | Preço do serviço (decimal, >= 0). |
| `durationMinutes` | `integer` | Sim | Duração estimada em minutos (inteiro > 0). |
| `isActive` | `boolean` | Não | Indica se o serviço está ativo (default: true). |
| `roleIds` | `string[]` (UUID) | Não | IDs de roles que podem executar o serviço (opcional). Será salvo em `service_roles`.

Exemplo de DTO (TypeScript):

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
	roleIds?: string[];
}
```

## 4. Processo Automático na Criação

Ao receber uma requisição válida, o sistema deve executar:

1. Autenticar o usuário (JWT) e autorizar conforme seção 2.
2. Validar payload com DTO e regras de negócio.
3. Verificar se o `salonId` existe (retornar `404` se não existir).
4. Checar duplicidade do `name` no salão (case-insensitive). Se duplicado, retornar `409`.
5. Inserir registro em `services` (campos: `salon_id`, `name`, `description`, `price`, `duration_minutes`, `is_active`).
6. Se `roleIds` fornecido:
	 - Validar cada `roleId` existe.
	 - Inserir registros em `service_roles` vinculando `service_id` ↔ `role_id`.
	 - Todas as operações devem ocorrer em uma transação única — se qualquer passo falhar, fazer rollback.
7. Retornar `201 Created` com o objeto `service` recém-criado.

## 5. Exemplo de Request

```json
{
	"name": "Corte de Cabelo",
	"description": "Corte masculino e feminino - inclui lavagem",
	"price": 50.00,
	"durationMinutes": 30,
	"roleIds": ["role-worker-uuid", "role-admin-uuid"]
}
```

## 6. Exemplo de Resposta (`201 Created`)

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

## 7. Erros e Códigos de Resposta

| Status | Código | Descrição |
| :--- | :--- | :--- |
| `400` | `VALIDATION_ERROR` | Dados inválidos (ex.: preço negativo, duração inválida, campos ausentes). |
| `401` | `UNAUTHORIZED` | Token JWT ausente ou inválido. |
| `403` | `FORBIDDEN` | Usuário sem permissão para criar serviço no salão. |
| `404` | `SALON_NOT_FOUND` | `salonId` não existe. |
| `409` | `SERVICE_ALREADY_EXISTS` | Serviço com mesmo nome já existe no salão. |

## 8. Regras de Negócio e Recomendações Técnicas

- Nome único por salão: aplicar verificação case-insensitive. No Postgres, use índice/constraint `UNIQUE (salon_id, lower(name))`.
- Preço: armazenar como `DECIMAL(10,2)` no banco e validar no DTO.
- Duração: validar limite máximo (ex.: <= 1440 minutos) para evitar entradas absurdas.
- Concorrência: usar transações e tratar UniqueConstraintViolation para retornar `409`.
- Sanitização: strip HTML e normalizar `description` antes de salvar.
- Atomicidade: criação do `service` e inserção em `service_roles` devem estar na mesma transação.

## 9. Auditoria e Eventos

- Gravar `created_by` (id do usuário) no registro ou em tabela de auditoria para rastreabilidade.
- Emitir evento `service.created` (opcional) para atualizar caches, sistemas externos ou frontend em tempo real.

## 10. Testes Recomendados

- Unit tests:
	- `ServiceService.create()` — fluxo feliz e validações.
	- Testes de autorização: `super_admin`, `owner`, `admin`, `worker` com/sem permissão.
	- Testes de validação do DTO (name, price, duration).
- Integration/E2E:
	- Criar serviço via API com `roleIds` e verificar relacionamentos.
	- Tentar criar serviço duplicado → esperar `409`.
	- Worker sem permissão → `403`.

## 11. Critérios de Aceitação

- Endpoint protegido por JWT e retornando `201 Created` no fluxo feliz.
- Nome único por salão garantido (validação + constraint no DB).
- Transação assegura atomicidade entre `services` e `service_roles`.

---

Observação: alinhar a permissão canônica `services.create` com os seeds de permissões (usar `services.create` em vez de `CREATE_SERVICE` para dot-notation consistente).
