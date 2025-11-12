# Funcionalidade: Registrar / Gerenciar Papéis (`Roles.Create` / `Roles.Manage`)

Este documento descreve o processo para registrar novos papéis (roles) no sistema e as regras associadas à administração desses papéis. Papéis representam conjuntos de responsabilidades e, via pivot `role_permissions`, são mapeados para permissões canônicas (dot-notation). Papéis padrão recomendados: `owner`, `admin`, `worker`, `client`.

## 1. Endpoint(s) da API

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **POST** | `/api/roles` | Cria um novo papel global (ex.: para casos especiais). Requer permissão administrativa. |
| **GET** | `/api/roles` | Lista papéis disponíveis (público/protegido conforme implementação). |
| **PUT** | `/api/roles/:roleId` | Atualiza metadados do papel (nome, descrição, scope). |
| **DELETE** | `/api/roles/:roleId` | Remove/Desativa um papel (restrito; cuidado com referências). |

> Observação: em muitos casos os papéis padrão são seedados (`owner`, `admin`, `worker`, `client`) e não exigem criação via API. A criação via API destina-se a casos personalizados ou integrações.

## 2. Controle de Acesso e Permissões

A gestão de papéis é uma operação sensível. Recomendações de acesso:

| Usuário/Role | Permissão necessária | Observações |
| :--- | :--- | :--- |
| **Super Admin** (`global_role = 'super_admin'`) | Nenhuma | Acesso completo para criar/atualizar/remover papéis. |
| **Admin (global)** | `roles.manage` | Pode criar/atualizar papéis globais conforme políticas internas. |
| **Owner / Admin (salão)** | Não-recomendado | Alterar papéis globais não é recomendado por causa do impacto global; permitir somente se a regra de negócio justificar. |

Regras de autorização (implementação esperada):
- Operações CRUD sobre a tabela `roles` devem ser protegidas por `roles.manage` ou limitadas a `super_admin`.
- Atribuição de papéis a usuários em um salão acontece via endpoints de `user_salon_roles` e segue regras descritas em `REGISTRAR_USUARIO.md` (owner/admin pode atribuir, etc.).

## 3. Estrutura da Requisição (Request Body)

Campos esperados ao criar/atualizar um papel.

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `name` | `string` | Sim | Nome do papel (ex.: `owner`). Único no escopo definido. |
| `description` | `string` | Não | Descrição legível do papel. |
| `scope` | `string` (`'global'|'salon'`) | Sim | Escopo do papel. `global` afeta sistema inteiro; `salon` é usado em `user_salon_roles`. |
| `isDefault` | `boolean` | Não | Indica se o papel é um papel padrão seedado (não removível sem migração). |

Exemplo de DTO (TypeScript):

```ts
export class CreateRoleDto {
  @IsString() @MaxLength(50) name: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(['global','salon']) scope: 'global' | 'salon';
  @IsOptional() @IsBoolean() isDefault?: boolean;
}
```

## 4. Regras de Validação e Negócio

- `name`: obrigatório, sem espaços no início/fim; max 50 chars; UNIQUE por `scope` (ex.: `UNIQUE(scope, lower(name))`).
- `scope`: se `global`, cuidados extras (impacto amplo). Mudar o `scope` de um papel existente deve ser feito via migration e com revisão.
- `isDefault`: papéis seedados devem ter `isDefault=true` e não serem removidos via API (apenas desativados via flag `is_active` e exigir migration para remoção definitiva).
- Ao remover um papel, verificar referências em `user_salon_roles`, `role_permissions` e `service_roles` — exigir que estes vínculos sejam removidos ou migrados antes.

Casos específicos:
- Renomeação de papel: providenciar migration que atualize referências no pivot para evitar inconsistências.
- Papéis customizados: ao criar papéis customizados, registrar permissão de gerenciamento (`roles.manage`) e documentar o uso.

## 5. Fluxo de Criação / Atualização (Passo a Passo)

1. Autenticar e verificar permissão (`roles.manage` ou `super_admin`).
2. Validar payload (DTO + regras de negócio: unicidade, scope válido).
3. Inserir/Atualizar registro em `roles` (campos: `name`, `description`, `scope`, `is_default`, `is_active`).
4. Se for criação de papel padrão (ex.: during seed), marcar `isDefault=true` e não expor endpoint de deleção em produção sem migração.
5. Retornar `201 Created` (criação) ou `200 OK` (atualização) com o objeto do papel.

## 6. Exemplo de Request

```json
{
  "name": "receptionist",
  "description": "Atende clientes e agenda serviços",
  "scope": "salon",
  "isDefault": false
}
```

## 7. Exemplo de Resposta (201 Created)

```json
{
  "id": "role-uuid-1234",
  "name": "receptionist",
  "description": "Atende clientes e agenda serviços",
  "scope": "salon",
  "isDefault": false,
  "isActive": true,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

## 8. Erros e Códigos de Resposta

| Status | Código | Descrição |
| :--- | :--- | :--- |
| 400 Bad Request | `VALIDATION_ERROR` | Dados inválidos ou nome fora das regras. |
| 401 Unauthorized | `UNAUTHORIZED` | Token ausente ou inválido. |
| 403 Forbidden | `FORBIDDEN` | Usuário sem permissão (`roles.manage` ou `super_admin`). |
| 404 Not Found | `ROLE_NOT_FOUND` | `roleId` não existe (para update/delete). |
| 409 Conflict | `ROLE_NAME_CONFLICT` | Já existe papel com mesmo nome no mesmo scope. |

## 9. Auditoria, Logs e Segurança

- Registrar `created_by` / `updated_by` (user id) em `roles` ou em tabela de auditoria para rastreabilidade.
- Auditar alterações críticas (remoção/renomeação) e exigir dupla confirmação em UI/Admin.
- Proteger endpoints de deleção/alteração sensível com requisitos adicionais (ex.: MFA/approval) se o negócio exigir.

## 10. Integração com Permissões (role_permissions)

- Papéis devem ser mapeados para permissões via pivot `role_permissions`.
- Permissões canônicas devem ser strings em dot-notation (ex.: `services.create`, `appointments.manage`).
- Recomenda-se criar seeds que populam permissões canônicas e mapear `owner`/`admin`/`worker`/`client` apropriadamente.

Operação comum: quando criar um papel novo, o fluxo de admin pode também criar/associar um conjunto inicial de permissões:
1. Criar role.
2. Validar/gerar permissões necessárias (criar em `permissions` se não existirem).
3. Inserir `role_permissions` para associar as permissões ao papel.

## 11. Testes Recomendados

- Unit:
  - `RolesService.create()` — validação de DTO, unicidade e persistência.
  - `RolesService.update()` — renomeação segura e validação de scope.
- Integration/E2E:
  - Criar role via API → `201`.
  - Criar role com nome duplicado → `409`.
  - Tentar criar role sem permissão → `403`.

## 12. Critérios de Aceitação

- Endpoints protegidos por JWT e permissões (`roles.manage` ou `super_admin`).
- Nomes únicos por `scope` garantidos por validação e constraint DB.
- Papéis padrão marcados como `isDefault` não removíveis via API sem migration.

---

Observação: alinhar seeds e `DIRETRIZES.md` para incluir a lista de permissões canônicas e o mapeamento inicial de permissões para os papéis padrão (`owner`, `admin`, `worker`, `client`).
