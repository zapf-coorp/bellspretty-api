# Funcionalidade: Registrar e Gerenciar Permissões (`Permissions.Create` / `Permissions.Manage`)

Este documento define o fluxo para criação, listagem e gestão de permissões canônicas do sistema. Permissões são strings em dot-notation (ex.: `services.create`, `appointments.manage`) e são associadas a papéis via o pivot `role_permissions`.

## 1. Endpoint(s) da API

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **GET** | `/api/permissions` | Lista permissões disponíveis (paginação/opções de filtro). |
| **POST** | `/api/permissions` | Cria uma nova permissão canônica. Requer permissão administrativa. |
| **PUT** | `/api/permissions/:permissionId` | Atualiza metadados da permissão (descrição). |
| **DELETE** | `/api/permissions/:permissionId` | Remove/Desativa uma permissão (restrito; migrar referências antes). |

> Observação: muitas permissões do sistema devem ser seedadas em `docs/seeds/seed_permissions.sql` ou via scripts idempotentes; criação em runtime destina-se a casos avançados/integrados.

## 2. Controle de Acesso e Permissões

A gestão de permissões é sensível e deve ser restrita:

| Usuário/Role | Permissão necessária | Observações |
| :--- | :--- | :--- |
| **Super Admin** (`global_role = 'super_admin'`) | Nenhuma | Acesso completo para criar/atualizar/remover permissões. |
| **Admin (global)** | `permissions.manage` | Permite CRUD sobre permissões se a política do produto permitir. |

Regras de autorização (implementação esperada):
- Operações de criação/alteração/deleção de permissões devem exigir `permissions.manage` ou `super_admin`.
- Endpoints de listagem podem ser públicos ou restritos conforme necessidade (recomendado protegê-los quando expõem metadados sensíveis).

## 3. Estrutura da Requisição (Request Body)

Campos esperados ao criar/atualizar uma permissão.

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `name` | `string` | Sim | Nome canônico da permissão (dot-notation). Ex.: `services.create`. Deve ser único por `scope`. |
| `description` | `string` | Não | Texto explicativo do propósito da permissão. |
| `scope` | `string` (`'global'|'salon'`) | Sim | Indica se a permissão aplica-se ao sistema ou a um salão específico. |

Exemplo de DTO (TypeScript):

```ts
export class CreatePermissionDto {
  @IsString() @MaxLength(100) name: string; // dot-notation
  @IsOptional() @IsString() description?: string;
  @IsEnum(['global','salon']) scope: 'global' | 'salon';
}
```

Validações recomendadas:
- `name`: somente caracteres válidos para dot-notation (letras, números, `.` e `_`), max 100 chars.
- `scope`: obrigatório — quando `scope='salon'`, a verificação de permissão runtime deve aceitar um `salonId` para checagem contextual.

## 4. Regras de Negócio

- Permissões são tratadas como identidades canônicas; não renomeie permissões sem criar migration que atualize referências em `role_permissions`.
- `name` deve ser único por `scope` (ex.: `UNIQUE(scope, name)`).
- Seeds: definir lista canônica mínima (ex.: `services.create`, `services.manage`, `appointments.create`, `appointments.manage`, `products.manage`, `messages.send`, `permissions.manage`).
- Ao remover uma permissão, remover antes todas as referências em `role_permissions` ou migrá-las para uma permissão substituta.

Casos de uso práticos:
- Permissão `services.create` (scope salon) — usada pelo guard ao criar serviços dentro de um salão.
- Permissão `permissions.manage` (scope global) — usada para proteger endpoints de CRUD de permissões.

## 5. Fluxo de Criação (Passo a Passo)

1. Autenticar e verificar `permissions.manage` ou `super_admin`.
2. Validar payload (DTO + regras: unicidade, formato de name).
3. Inserir registro em `permissions` (campos: `name`, `description`, `scope`, `is_active`).
4. (Opcional) Associar imediatamente a permission a papéis via `role_permissions` (por exemplo durante seed/admin UX).
5. Retornar `201 Created` com o objeto da permissão.

## 6. Exemplo de Request

```json
{
  "name": "services.create",
  "description": "Permite criar serviços no salão",
  "scope": "salon"
}
```

## 7. Exemplo de Resposta (201 Created)

```json
{
  "id": "perm-uuid-1234",
  "name": "services.create",
  "description": "Permite criar serviços no salão",
  "scope": "salon",
  "isActive": true,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

## 8. Erros e Códigos de Resposta

| Status | Código | Descrição |
| :--- | :--- | :--- |
| 400 Bad Request | `VALIDATION_ERROR` | Payload inválido (nome mal-formado, campo ausente). |
| 401 Unauthorized | `UNAUTHORIZED` | Token ausente ou inválido. |
| 403 Forbidden | `FORBIDDEN` | Usuário sem `permissions.manage`/`super_admin`. |
| 404 Not Found | `PERMISSION_NOT_FOUND` | `permissionId` não existe (para update/delete). |
| 409 Conflict | `PERMISSION_CONFLICT` | Permissão com mesmo `name` e `scope` já existe. |

## 9. Auditoria, Logs e Impacto

- Registrar `created_by` / `updated_by` para rastreabilidade.
- Quando permissões mudarem, invalidar cache de permissões dos usuários afetados (TTL curto + listener em `role_permissions`).
- Logar alterações críticas (criação, deleção, renomeação) em sistema de auditoria para compliance.

## 10. Integração com Papéis (role_permissions)

- Workflow comum: após criar permissões canônicas, associá-las a papéis padrão (`owner`, `admin`, `worker`, `client`) via `role_permissions`.
- Fornecer UI/Admin UX para mapear permissões a papéis com operações idempotentes.
- Scripts/seeds devem ser idempotentes e usar `ON CONFLICT` / `INSERT OR IGNORE` quando possível.

Exemplo de seed mínimo recomendado (conceitual):

- `services.create`, `services.manage`, `appointments.create`, `appointments.manage`, `products.manage`, `messages.send`, `permissions.manage`.

## 11. Guards / Decorators / Helpers (Implementação em runtime)

- Decorator sugerido: `@Permissions('services.create')`.
- `PermissionsGuard` deve:
  1. Extrair usuário e `salonId` (quando aplicável) do request.
  2. Bypass para `global_role = 'super_admin'`.
  3. Consultar cache (`Redis` / memory) de permissões do usuário; se ausente, carregar de DB via `user_salon_roles` + `role_permissions`.
  4. Verificar presença da permissão requerida.

Helpers úteis:
- `getUserPermissions(user, salonId?)` → retorna lista de permission names.
- `hasPermission(user, permissionName, salonId?)` → boolean.

## 12. Testes Recomendados

- Unit:
  - `PermissionsService.create()` — validação e persistência.
  - `PermissionsGuard` — bypass super_admin, worker/role checks.
- Integration/E2E:
  - Seedar permissões → verificar listagem via API.
  - Associar permissão a role → garantir `hasPermission` para usuário com role associada.

## 13. Critérios de Aceitação

- Permissões seedadas e visíveis via API (`GET /api/permissions`).
- Criação protegida por `permissions.manage` ou `super_admin` e retorna `201` no fluxo feliz.
- Nome único por `scope` garantido por constraint DB e validação na aplicação.

---

Observação: alinhar a lista de permissões canônicas em `DIRETRIZES.md` e criar um script de seed idempotente (`scripts/seed-permissions.ts` ou `docs/seeds/seed_permissions.sql`).
