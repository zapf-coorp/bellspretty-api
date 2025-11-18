# Funcionalidade: Atribuir Papéis a Usuários em um Salão (`UserSalonRoles.Assign`)

Este documento descreve o processo para atribuir (e remover) papéis a usuários dentro do contexto de um salão. A atribuição cria um vínculo entre `user`, `salon` e `role` na tabela pivot `user_salon_roles` e está sujeita a políticas de autorização específicas do salão.

## 1. Endpoint(s) da API

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **POST** | `/api/salons/:salonId/roles/assign` | Atribui um papel a um usuário dentro do salão. |
| **POST** | `/api/salons/:salonId/roles/revoke` | Revoga um papel de um usuário no salão. |
| **GET** | `/api/salons/:salonId/users` | Lista usuários do salão com seus papéis (paginado/filtrável). |

## 2. Controle de Acesso e Permissões

A atribuição de papéis é controlada por regras de hierarquia locais e, quando aplicável, por permissões canônicas.

| Papel do Requisitante | Papéis que pode Atribuir no Salão | Observações |
| :--- | :--- | :--- |
| **Super Admin** (`global_role = 'super_admin'`) | `owner`, `admin`, `worker`, `client` | Pode atribuir qualquer papel em qualquer salão. |
| **Owner** (do salão) | `admin`, `worker`, `client` | Owner tem permissão plena dentro do salão. |
| **Admin** (do salão) | `worker`, `client` | Admin pode gerenciar papéis subordinados. |
| **Worker** (do salão) | `client` | Worker só pode atribuir papéis menos privilegiados (opcional, conforme política). |

Regras de autorização (implementação esperada):
- Verificar `global_role = 'super_admin'` → permitir.
- Senão, buscar `user_salon_roles` do requisitante para `salonId`:
  - Se requisitante é `owner` → permitir para os papéis listados.
  - Se requisitante é `admin` → permitir conforme tabela acima.
  - Caso contrário → 403.
- Em cenários avançados, exigir permissão canônica (ex.: `users.assign`) via `role_permissions`.

## 3. Estrutura da Requisição (Request Body)

Request para atribuir um papel (`AssignRoleDto`):

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `userId` | `uuid` | Sim | ID do usuário que receberá o papel. |
| `roleId` | `uuid` | Sim | ID do papel a ser atribuído (ex.: owner/admin/worker/client). |
| `isActive` | `boolean` | Não | Se o vínculo ficará ativo (default: `true`). |

```ts
export class AssignRoleDto {
  @IsUUID() userId: string;
  @IsUUID() roleId: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
```

Request para revogar (`RevokeRoleDto`):

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `userId` | `uuid` | Sim | ID do usuário que perderá o papel. |
| `roleId` | `uuid` | Sim | ID do papel a ser revogado. |

```ts
export class RevokeRoleDto {
  @IsUUID() userId: string;
  @IsUUID() roleId: string;
}
```

## 4. Regras de Validação e Negócio

- `userId` e `roleId` devem existir; retornar `404` se não existirem.
- Não permitir duplicidade: se já existir `user_salon_roles` com `userId`, `salonId`, `roleId` e `is_active = true`, retornar `409`.
- Ao atribuir `owner`: somente `super_admin` pode designar `owner` em salões já existentes (salvo fluxo de criação de salão onde owner pode ser definido automaticamente).
- Limitar número de owners se a política do produto exigir (ex.: apenas 1 owner por salão) — caso aplicável, validar e retornar `409` se violado.
- Todas as operações são transacionais: a atribuição e quaisquer side-effects (notificações, auditoria) devem falhar juntas.

Casos de borda e recomendações técnicas:
- Se um usuário não existe, retornar `404 USER_NOT_FOUND`.
- Se o papel não pertence ao catálogo (`role.scope` incompatível), retornar `400 ROLE_SCOPE_MISMATCH`.
- Implementar soft-delete / desativação via `is_active` e `deleted_at` em vez de remoção física.

## 5. Fluxo (Passo a Passo)

1. Autenticar o requisitante (JWT).
2. Verificar autorização conforme seção 2.
3. Validar payload (DTO + existência de `user` / `role` / `salon`).
4. Checar duplicidade de vínculo; se já ativo, retornar `409`.
5. Iniciar transação:
   - Inserir ou atualizar registro em `user_salon_roles` com `user_id`, `salon_id`, `role_id`, `is_active`.
   - Registrar auditoria (`created_by` / `reason` / `timestamp`).
   - Emitir notificação opcional ao usuário (ex.: `role.assigned`).
   - Commit se tudo ok; rollback caso contrário.
6. Retornar `201 Created` com o objeto do vínculo ou `200 OK` em atualizações idempotentes.

## 6. Exemplo de Request

```json
{
  "userId": "c4a2b1d0-1234-5678-9abc-def012345678",
  "roleId": "role-worker-uuid",
  "isActive": true
}
```

## 7. Exemplo de Resposta (201 Created)

```json
{
  "id": "user-salon-role-uuid-1",
  "userId": "c4a2b1d0-1234-5678-9abc-def012345678",
  "salonId": "salon-1-uuid",
  "roleId": "role-worker-uuid",
  "isActive": true,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

## 8. Erros e Códigos de Resposta

| Status | Código | Descrição |
| :--- | :--- | :--- |
| 400 Bad Request | `VALIDATION_ERROR` | Dados inválidos (tipos, formatos). |
| 401 Unauthorized | `UNAUTHORIZED` | Token ausente ou inválido. |
| 403 Forbidden | `FORBIDDEN` | Requisitante não tem permissão para atribuir este papel. |
| 404 Not Found | `USER_NOT_FOUND` / `ROLE_NOT_FOUND` / `SALON_NOT_FOUND` | Entidade não encontrada. |
| 409 Conflict | `USER_ALREADY_HAS_ROLE` / `OWNER_CONSTRAINT` | Vinculo já existe ou política (ex.: owner único) violada. |

## 9. Auditoria, Notificações e Eventos

- Gravar `created_by` e `reason`/`notes` em log/auditoria para rastreabilidade.
- Emitir evento `role.assigned` / `role.revoked` para subsistemas (notificações, sync cache).
- Invalidação de cache: quando `user_salon_roles` mudar, invalidar permissões em cache do usuário.

## 10. Testes Recomendados

- Unit:
  - `UserSalonRolesService.assign()` — fluxo feliz e tratamento de erros (404, 403, 409).
  - Validações de DTO e regra de owner único (se aplicável).
- Integration/E2E:
  - Atribuir papel como `owner`/`admin` → `201`.
  - Worker sem permissão tenta atribuir `admin` → `403`.
  - Atribuir papel duplicado → `409`.

## 11. Critérios de Aceitação

- Endpoint protegido por JWT e regras de autorização conforme seção 2.
- Atribuição bem-sucedida retorna `201` e cria `user_salon_roles` com `is_active=true`.
- Remoção/revogação marca o vínculo `is_active=false` (soft-delete) e dispara auditoria/evento.

---

Observação: alinhar `REGISTRAR_ROLES_USERS_SALON.md` com o fluxo de `REGISTRAR_USUARIO.md` e com seeds das roles (ver `DIRETRIZES.md` e `docs/seeds/seed_roles.sql`).
