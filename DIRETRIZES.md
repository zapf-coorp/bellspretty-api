# 📋 TODO List - Módulo de Schemas

## 🧾 Schema: Users (Lista de Tarefas)

Checklist para definir e implementar o schema `users` de forma clara e implementável.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `name` VARCHAR(100) NOT NULL
  - `email` VARCHAR(255) UNIQUE NOT NULL
  - `password` VARCHAR(255) NOT NULL (armazenar hashed)
  - `phone` VARCHAR(20) NULLABLE
  - `global_role` ENUM('super_admin','user') DEFAULT 'user'
  - `is_active` BOOLEAN DEFAULT TRUE
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `deleted_at` TIMESTAMP
- [ ] Constraints/Checks: email format, optional CHECK para `global_role`
- [ ] Índices: UNIQUE(email), INDEX(global_role), INDEX(is_active)
- [ ] Políticas de deleção: definir soft-delete via `is_active` e `deleted_at` (recomendado soft-delete)

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/user.entity.ts` com colunas em snake_case e mapeamentos:
  - OneToMany -> `RefreshToken`
  - OneToMany -> `UserSalonRole`
  - OneToMany -> `Appointment` (client) e (worker)
  - OneToMany -> `Message` (recipient/sender se aplicável)
- [ ] Aplicar `@Index`, `@Unique` e `@BeforeInsert` para normalizações (ex.: lower(email))
- [ ] Não expor `password` em toJSON/serializers (use transformer/exclude)

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateOrUpdateUsers` e revisar SQL
- [ ] Implementar up/down idempotentes
- [ ] Se migrando de schema antigo, criar migration para migração de dados (normalizar emails, preencher `global_role`)

### D. Seeds e Dados de Desenvolvimento
- [ ] Seed para roles (já presente) e seed para um `super_admin` (usar password hashed de dev)
- [ ] Adicionar `docs/seeds/seed_users.sql` ou `scripts/seed-users.ts` com dados de exemplo (idempotente)

### E. DTOs e Validações (class-validator)
- [ ] `src/modules/users/dto/register-user.dto.ts` — name, email, password (validations)
- [ ] `src/modules/users/dto/login.dto.ts` — email, password
- [ ] `src/modules/users/dto/update-user.dto.ts` — PartialType para campos editáveis
- [ ] `src/modules/users/dto/paginate-users.dto.ts` — page, limit, filters

### F. Service, Controller e Endpoints
- [ ] Criar `UsersModule`, `UsersService`, `UsersController` (se não existirem)
- [ ] Endpoints recomendados:
  - POST /api/auth/register — registrar
  - POST /api/auth/login — autenticar
  - GET  /api/auth/profile — obter perfil (auth)
  - GET  /api/users — listar (admin)
  - GET  /api/users/:id — detalhes (owner/admin)
  - PUT  /api/users/:id — atualizar (owner/admin)
  - PATCH /api/users/:id/deactivate — desativar (soft-delete)
  - DELETE /api/users/:id — remover permanentemente (restrito)
- [ ] Garantir que `password` nunca seja retornado

### G. Segurança e Operações Sensíveis
- [ ] Hash de senha com `bcrypt` (saltRounds >= 10) no serviço antes de persistir
- [ ] Rate-limit para endpoints sensíveis (login/register)
- [ ] Implementar lockout/monitoramento de tentativas de login
- [ ] Uso seguro de tokens (rotacionamento de refresh tokens já existente)

### H. Tests
- [ ] Unit tests para `UsersService` (criar, atualizar, autenticar, desativar)
- [ ] E2E tests para registro/login/profile
- [ ] Testar migrations up/down em SQLite em memória

### I. Documentação e Swagger
- [ ] Documentar DTOs e endpoints com `@ApiTags('Users')` e `@ApiOperation`
- [ ] Atualizar `DIRETRIZES.md` com links para migrations e seeds geradas

### J. Checklist de Aceitação
- [ ] Migration aplicada em dev sem erros
- [ ] Endpoints de autenticação funcionando com tokens e refresh
- [ ] Testes unitários e e2e para os fluxos críticos passando
- [ ] Documentação atualizada (README / DIRETRIZES)


## 🧾 Schema: Roles (Lista de Tarefas)

Checklist para definir e implementar o schema `roles` (papéis do sistema e integração RBAC).

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `name` VARCHAR(50) UNIQUE NOT NULL (ex.: owner, admin, worker, client)
  - `description` TEXT NULLABLE
  - `scope` ENUM('global','salon') DEFAULT 'salon'  # indica se é um papel global ou específico de salão
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- [ ] Constraints/checks: UNIQUE(name), optional CHECK para `scope`
- [ ] Índices: UNIQUE(name), INDEX(scope)

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/role.entity.ts` com colunas snake_case e relacionamentos:
  - OneToMany -> `UserSalonRole` (pivot)
  - (Opcional) ManyToMany -> `User` via pivot para consultas simplificadas
- [ ] Garantir serialização segura (não expor dados que não devam sair via API)

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateOrUpdateRoles` e revisar SQL
- [ ] Implementar up/down idempotentes
- [ ] Se houver roles pré-existentes, criar migration para mapear/migrar valores antigos para o novo modelo

### D. Seeds e Dados de Desenvolvimento
- [ ] Seed idempotente para papéis padrão: `owner`, `admin`, `worker`, `client` (usar ON CONFLICT/INSERT OR IGNORE)
- [ ] Atualizar `docs/seeds/seed_roles.sql` e `scripts/seed-roles.ts` se necessário (IDs previsíveis para testes)

### E. Integração RBAC / Políticas
- [ ] Documentar distinção entre `global_role` em `users` (super_admin) e `roles` por salão
- [ ] Implementar helpers/utilitários: `hasGlobalRole(user, roles[])`, `hasSalonRole(user, salonId, roles[])`
- [ ] Atualizar Guards/Policies para usar a nova `roles` table + pivot `user_salon_roles`

### F. Endpoints e Administração
- [ ] Endpoints recomendados (protegidos por `super_admin` / admin):
  - GET  /api/roles — listar
  - POST /api/roles — criar
  - PUT  /api/roles/:id — atualizar
  - DELETE /api/roles/:id — remover (cautela)
  - (Admin UI/API) atribuir roles por salão via pivot endpoints (já previstos em user_salon_roles checklist)
- [ ] Validar que remoção de role com referências falhe / exija migração antes

### G. Segurança e Consistência
- [ ] Proteger operações destrutivas (remoção/alteração de roles críticos)
- [ ] Quando renomear roles, prover migration que atualize referências no pivot

### H. Tests
- [ ] Unit tests para `RoleService` (criar, listar, atualizar, remover)
- [ ] Integration tests para APIs administrativas e interação com `user_salon_roles`
- [ ] E2E tests cobrindo atribuição e verificação de permissões

### I. Documentação e Swagger
- [ ] Documentar endpoints em Swagger (`@ApiTags('Roles')`)
- [ ] Adicionar exemplos para: criação, atribuição, revogação e verificação de permissões

### J. Checklist de Aceitação
- [ ] Roles padrão seedadas e visíveis via API
- [ ] Atribuição/revocação via pivot funciona com checks de permissão
- [ ] Testes críticos verdes e documentação atualizada





## 🧾 Schema: Permissions (Lista de Tarefas)

Checklist para a tabela `permissions` e pivot `role_permissions`, que implementam um RBAC orientado a permissões.

### A. Design e Especificação
- [ ] Tabelas principais:
  - `permissions`:
    - `id` UUID PK
    - `name` VARCHAR(150) UNIQUE NOT NULL (ex.: `appointments.create`, `salons.manage.settings`)
    - `description` TEXT NULLABLE
    - `scope` ENUM('global','salon') DEFAULT 'salon' # determina se a permissão precisa de contexto de salão
    - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `role_permissions` (pivot):
    - `id` UUID PK
    - `role_id` UUID FK -> `roles.id`
    - `permission_id` UUID FK -> `permissions.id`
    - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- [ ] Constraints: `UNIQUE(role_id, permission_id)` para evitar duplicatas
- [ ] Índices: `INDEX(name)`, `INDEX(scope)`, `INDEX(role_id)` para consultas rápidas

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/permission.entity.ts` com colunas em snake_case
- [ ] Criar `src/entities/role-permission.entity.ts` (ou mapear ManyToMany via JoinTable em `role.entity.ts`)
- [ ] Mapear relacionamentos:
  - `ManyToMany` <-> `Role` via `role_permissions`
- [ ] Expor um helper `Role.getPermissions()` que retorna a lista de permission names (string[])

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreatePermissions` e revisar SQL
- [ ] Implementar up/down idempotentes e garantir FK `ON DELETE CASCADE` para limpeza quando role/permissão deletada
- [ ] Seed migration para popular permissões canônicas e mapear para roles padrão (owner/admin/worker/client)

### D. Seeds e Dados de Desenvolvimento
- [ ] Criar seed idempotente `docs/seeds/seed_permissions.sql` ou `scripts/seed-permissions.ts`
- [ ] Seed padrão mínimo (exemplos):
  - `salons.view`, `salons.manage`, `appointments.create`, `appointments.manage`, `products.sell`, `products.manage`, `messages.send`, `permissions.manage`
- [ ] Mapear seeds para roles: owner -> all salon perms; admin -> manage appointments/products/messages; worker -> appointments.update; client -> appointments.create

### E. DTOs e Validações
- [ ] `src/modules/roles/dto/assign-permission.dto.ts` — `roleId`, `permissionId` or `permissionName`
- [ ] `src/modules/roles/dto/revoke-permission.dto.ts` — `roleId`, `permissionId`
- [ ] Validations: `IsUUID`, `IsString`, `MaxLength` para `name`

### F. Service, Controller e Endpoints
- [ ] Criar `PermissionsModule`, `PermissionsService`, `PermissionsController` (simples CRUD)
- [ ] Endpoints recomendados (protegidos por `super_admin` / `permissions.manage`):
  - `GET    /api/permissions` — listar
  - `POST   /api/permissions` — criar
  - `PUT    /api/permissions/:id` — atualizar
  - `DELETE /api/permissions/:id` — remover
  - `POST   /api/roles/:roleId/permissions/assign` — atribuir permissão a role
  - `POST   /api/roles/:roleId/permissions/revoke` — revogar permissão da role
- [ ] Auditar alterações (quem, quando, role/permissão alterada)

### G. Business Rules e Regras de Negócio
- [ ] Permissões tratadas como strings canônicas (dot-notation) para permitir hierarquia/namespace
- [ ] Suportar `scope` das permissões (global vs salon): ao verificar permissão, exigir `salonId` quando `scope = 'salon'`
- [ ] Comportamento de herança: roles carregam permissões via pivot; usuários herdam permissões por seus `user_salon_roles` + `role_permissions`
- [ ] Implementar rolagem (short-circuit) para `super_admin` via `global_role` no usuário
- [ ] Invalidação/rotina: quando role_permissions mudarem, invalidar cache de permissões do usuário
- [ ] Política de fallback: se RBAC enforcement estiver desativado (feature flag), apenas logar verificações negadas

### H. Guards / Decorators / Helpers (Autorização em runtime)
- [ ] Implementar decorators reutilizáveis:
  - `@Permissions('appointments.create')` — exige permissão
  - `@AnyPermissions(['appointments.create','appointments.manage'])` — OR
  - `@AllPermissions([...])` — AND
- [ ] Guard `PermissionsGuard` que:
  - Extrai usuário do request
  - Resolve permissões efetivas (global + salon-scoped roles)
  - Suporta leitura de `salonId` de params/body/context
  - Verifica cache (Redis/memory) e permite bypass para super_admin
- [ ] Utilitários: `getUserPermissions(user, salonId?)`, `hasPermission(user, permission, salonId?)`
- [ ] Cache de permissões por usuário com TTL e invalidação via listener em changes to `role_permissions`/`user_salon_roles`

### I. Tests
- [ ] Unit tests para `PermissionsService`, `PermissionsGuard` e helpers `hasPermission`/`getUserPermissions`
- [ ] Integration/E2E tests cobrindo cenários:
  - owner/admin/worker/client em mesmo e diferentes salões
  - permissão negada (403) quando esperado
  - super_admin sempre autorizado
  - cache/invalidação de permissões
- [ ] Tests para seeds/migration idempotência

### J. Documentação e Swagger / Dev DX
- [ ] Documentar lista de permissões canônicas em `DIRETRIZES.md` (tabela) e exemplos de uso dos decorators
- [ ] Atualizar Swagger para indicar required permission per endpoint (usar decorator para anotar `@ApiOperation({ summary, security: ['bearer'] })` e custom metadata com permission)
- [ ] Criar script `scripts/sync-permissions.ts` para sincronizar permissões definidas no código com DB (opcional)
- [ ] Checklist de aceitação:
  - [ ] Migration criada e aplicada em dev
  - [ ] Seeds carregam permissões canônicas
  - [ ] Endpoints de CRUD de permissões funcionando e protegidos
  - [ ] Decorators/Guards aplicados aos endpoints críticos (appointments/products/messages/salons)
  - [ ] Cache/invalidação testados e funcionando
  - [ ] Documentação e exemplos atualizados em `DIRETRIZES.md`

## 🧾 Schema: Salons (Lista de Tarefas)

Checklist para a tabela `salons`, a entidade central que representa cada salão de beleza.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `name` VARCHAR(100) NOT NULL
  - `slug` VARCHAR(100) UNIQUE NOT NULL (gerado a partir do nome)
  - `description` TEXT NULLABLE
  - `address` TEXT NULLABLE
  - `phone` VARCHAR(20) NULLABLE
  - `email` VARCHAR(255) NULLABLE
  - `business_hours` JSON NULLABLE
  - `is_active` BOOLEAN DEFAULT TRUE
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `deleted_at` TIMESTAMP
- [ ] Constraints: `UNIQUE(slug)`
- [ ] Índices: `INDEX(is_active)`

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/salon.entity.ts`
- [ ] Mapear relacionamentos:
  - `OneToMany` -> `UserSalonRole`
  - `OneToMany` -> `Service`
  - `OneToMany` -> `Product`
  - `OneToMany` -> `Appointment`
  - `OneToMany` -> `Message`
- [ ] Implementar um `BeforeInsert` hook para gerar o `slug` a partir do `name`.

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateSalons` e revisar SQL.
- [ ] Garantir que a migration crie a tabela e o índice `UNIQUE` para `slug`.

### D. Seeds e Dados de Desenvolvimento
- [ ] Criar um seed para um salão de exemplo (`salon_default`).
- [ ] Adicionar em `docs/seeds/seed_salons.sql` ou `scripts/seed-salons.ts`.

### E. DTOs e Validações
- [ ] `src/modules/salons/dto/create-salon.dto.ts` — `name`, `description`, `phone`, etc.
- [ ] `src/modules/salons/dto/update-salon.dto.ts` — `PartialType` com campos editáveis.
- [ ] `src/modules/salons/dto/paginate-salons.dto.ts` — `page`, `limit`, `search`.

### F. Service, Controller e Endpoints
- [ ] Criar `SalonsModule`, `SalonsService`, `SalonsController`.
- [ ] Endpoints recomendados:
  - `POST /api/salons` — Criar um novo salão (protegido, talvez `super_admin` ou um plano pago).
  - `GET  /api/salons` — Listar todos os salões (público ou para usuários logados).
  - `GET  /api/salons/:idOrSlug` — Obter detalhes de um salão.
  - `PUT  /api/salons/:id` — Atualizar um salão (protegido para `owner`/`admin`).
  - `DELETE /api/salons/:id` — Desativar/remover um salão (protegido para `owner`).

### G. Segurança e Políticas de Acesso
- [ ] Implementar `Guard` para garantir que apenas `owner` ou `admin` possam modificar dados do salão.
- [ ] A criação de salões pode ser restrita a `super_admin` ou a um fluxo de onboarding específico.
- [ ] O `slug` deve ser único e sanitizado para evitar conflitos de URL.

### H. Tests
- [ ] Unit tests para `SalonsService` (criar, atualizar, encontrar por slug).
- [ ] E2E tests para todos os endpoints do `SalonsController`.
- [ ] Testar a lógica de permissão para edição e exclusão.

### I. Documentação e Swagger
- [ ] Documentar os endpoints de `Salons` com `@ApiTags('Salons')`.
- [ ] Adicionar exemplos de `business_hours` no DTO.

### J. Checklist de Aceitação
- [ ] Migration do `salons` aplicada com sucesso.
- [ ] Endpoints CRUD para salões funcionando conforme as regras de permissão.
- [ ] Geração automática de `slug` funcionando.
- [ ] Testes para os fluxos principais passando.




## 🧾 Schema: UserSalonRoles (Lista de Tarefas)

Checklist para a tabela pivot `user_salon_roles`, que gerencia a relação entre usuários, salões e papéis.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `user_id` UUID FK -> `users.id`
  - `salon_id` UUID FK -> `salons.id`
  - `role_id` UUID FK -> `roles.id`
  - `is_active` BOOLEAN DEFAULT TRUE
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `deleted_at` TIMESTAMP
- [ ] Constraints: `UNIQUE(user_id, salon_id, role_id)` para evitar duplicidade
- [ ] Índices: `INDEX(user_id, salon_id)`, `INDEX(salon_id, role_id)`
- [ ] Políticas de deleção: `ON DELETE CASCADE` para `user_id` e `salon_id`, `ON DELETE RESTRICT` para `role_id`

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/user-salon-role.entity.ts`
- [ ] Mapear relacionamentos `ManyToOne` para `User`, `Salon` e `Role`
- [ ] Adicionar `UniqueConstraint` para a combinação de chaves estrangeiras

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateUserSalonRoles` e revisar SQL
- [ ] Garantir que a migration crie a tabela, os índices e as chaves estrangeiras corretamente

### D. Seeds e Dados de Desenvolvimento
- [ ] Criar seed para atribuir papéis a usuários de teste em salões de teste (ex: `user_admin` como `owner` do `salon_default`)
- [ ] Adicionar em `docs/seeds/seed_assignments.sql` ou `scripts/seed-assignments.ts`

### E. DTOs e Validações
- [ ] `src/modules/salons/dto/assign-role.dto.ts` — `userId`, `roleId`
- [ ] `src/modules/salons/dto/revoke-role.dto.ts` — `userId`, `roleId`
- [ ] `src/modules/salons/dto/list-salon-users.dto.ts` — `page`, `limit`, `role` (filtro)

### F. Service, Controller e Endpoints
- [ ] Criar `UserSalonRolesService` para encapsular a lógica de atribuição/revogação
- [ ] Endpoints recomendados (aninhados sob salões):
  - `POST /api/salons/:salonId/roles/assign` — Atribuir papel a um usuário (admin/owner)
  - `POST /api/salons/:salonId/roles/revoke` — Revogar papel de um usuário (admin/owner)
  - `GET  /api/salons/:salonId/users` — Listar usuários e seus papéis no salão
  - `GET  /api/users/:userId/roles` — Listar todos os papéis de um usuário em todos os salões

### G. Segurança e Políticas de Acesso
- [ ] Implementar `Guard` que verifica se o usuário autenticado é `owner` ou `admin` do salão para poder gerenciar papéis
- [ ] Um usuário só pode ser atribuído a um salão se ele já existir no sistema
- [ ] Proteger endpoints para que apenas usuários autorizados possam ver a lista de membros de um salão

### H. Tests
- [ ] Unit tests para `UserSalonRolesService` (atribuir, revogar, listar)
- [ ] E2E tests para os endpoints de atribuição, revogação e listagem
- [ ] Testar cenários de permissão (ex: `worker` não pode atribuir papéis)

### I. Documentação e Swagger
- [ ] Documentar os novos endpoints em Swagger com `@ApiTags('Salons')` ou uma tag dedicada
- [ ] Adicionar exemplos de DTOs e respostas esperadas

### J. Checklist de Aceitação
- [ ] Migration aplicada com sucesso
- [ ] Endpoints de atribuição e revogação funcionam e são protegidos
- [ ] Listagem de usuários por salão e papéis por usuário está correta
- [ ] Testes cobrindo os fluxos principais estão passando


## 🧾 Schema: Services (Lista de Tarefas)

Checklist para a tabela `services`, que armazena os serviços oferecidos por cada salão.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `salon_id` UUID FK -> `salons.id`
  - `name` VARCHAR(100) NOT NULL
  - `description` TEXT NULLABLE
  - `price` DECIMAL(10,2) NOT NULL
  - `duration_minutes` INTEGER NOT NULL
  - `is_active` BOOLEAN DEFAULT TRUE
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `deleted_at` TIMESTAMP
- [ ] Constraints: `NOT NULL` em `salon_id`, `name`, `price`, `duration_minutes`; considerar CHECK(price >= 0)
- [ ] Índices: `INDEX(salon_id)`, `INDEX(is_active)`; `UNIQUE(salon_id, name)` opcional para evitar duplicatas por salão

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/service.entity.ts` com colunas em snake_case
- [ ] Mapear `ManyToOne` -> `Salon` e `OneToMany` -> `AppointmentService` (pivot)
- [ ] Aplicar validações/transformers: garantir arredondamento de `price`, tamanho máximo de `name`

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateServices` e revisar SQL
- [ ] Garantir que a migration crie FK `salon_id` com `ON DELETE CASCADE` e índices recomendados

### D. Seeds e Dados de Desenvolvimento
- [ ] Criar seed com serviços comuns de exemplo (ex.: Corte, Escova, Manicure) para `salon_default`
- [ ] Adicionar em `docs/seeds/seed_services.sql` ou `scripts/seed-services.ts` (idempotente)

### E. DTOs e Validações
- [ ] `src/modules/services/dto/create-service.dto.ts` — `salonId`, `name`, `price`, `durationMinutes`, `description?`
- [ ] `src/modules/services/dto/update-service.dto.ts` — `PartialType` para atualizações
- [ ] Validations: `IsUUID`, `IsString`, `IsNumber`, `Min(0)`, `MaxLength(100)` para `name`

### F. Service, Controller e Endpoints
- [ ] Criar `ServicesModule`, `ServicesService`, `ServicesController` (ou integrar em `SalonsModule`)
- [ ] Endpoints recomendados (aninhados sob salões):
  - `POST   /api/salons/:salonId/services` — Criar serviço (owner/admin)
  - `GET    /api/salons/:salonId/services` — Listar serviços do salão (público para visualizar)
  - `GET    /api/salons/:salonId/services/:id` — Detalhes do serviço
  - `PUT    /api/salons/:salonId/services/:id` — Atualizar serviço (owner/admin)
  - `PATCH  /api/salons/:salonId/services/:id/deactivate` — Desativar serviço (soft-delete)
  - `DELETE /api/salons/:salonId/services/:id` — Remover permanentemente (restrito)

### G. Business Rules e Regras de Negócio
- [ ] Ao criar um serviço, calcular e armazenar `duration_minutes` como inteiro
- [ ] Ao atualizar preço/duração, manter histórico via `appointment_services` (já presente) — não alterar registros históricos
- [ ] Permitir múltiplos serviços com mesmo nome em salões diferentes, mas evitar duplicatas no mesmo salão

### H. Tests
- [ ] Unit tests para `ServicesService` (criar, atualizar, listar, desativar)
- [ ] E2E tests para endpoints CRUD com checagem de permissões (owner/admin vs worker/client)
- [ ] Testar validações de DTOs (price negativo, nome muito longo, duration inválido)

### I. Documentação e Swagger
- [ ] Documentar endpoints de `Services` com `@ApiTags('Services')` ou `@ApiTags('Salons')`
- [ ] Adicionar exemplos de requisição/resposta e cenários de erro (400, 403, 404)

### J. Checklist de Aceitação
- [ ] Migration aplicada com sucesso
- [ ] Endpoints CRUD funcionando com validações e permissões
- [ ] Seeds de desenvolvimento carregados com serviços exemplares
- [ ] Testes unitários e e2e para os fluxos principais passando


## 🧾 Schema: Products (Lista de Tarefas)

Checklist para a tabela `products`, que armazena os produtos vendidos ou utilizados por cada salão.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `salon_id` UUID FK -> `salons.id`
  - `name` VARCHAR(100) NOT NULL
  - `description` TEXT NULLABLE
  - `brand` VARCHAR(50) NULLABLE
  - `price` DECIMAL(10,2) NOT NULL
  - `stock_quantity` INTEGER DEFAULT 0
  - `is_active` BOOLEAN DEFAULT TRUE
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `deleted_at` TIMESTAMP
- [ ] Constraints: `NOT NULL` em `salon_id`, `name`, `price`; considerar CHECK(price >= 0), CHECK(stock_quantity >= 0)
- [ ] Índices: `INDEX(salon_id)`, `INDEX(is_active)`, `INDEX(stock_quantity)` para controle de estoque

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/product.entity.ts` com colunas em snake_case
- [ ] Mapear `ManyToOne` -> `Salon` e `OneToMany` -> `AppointmentProduct` (pivot)
- [ ] Aplicar validações/transformers: garantir arredondamento de `price`, valores não-negativos para `stock_quantity`

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateProducts` e revisar SQL
- [ ] Garantir que a migration crie FK `salon_id` com `ON DELETE CASCADE` e índices recomendados
- [ ] Considerar triggers/checks para evitar estoque negativo (opcional, pode ser regra de negócio)

### D. Seeds e Dados de Desenvolvimento
- [ ] Criar seed com produtos de exemplo (ex.: Shampoo, Condicionador, Tintura) para `salon_default`
- [ ] Adicionar em `docs/seeds/seed_products.sql` ou `scripts/seed-products.ts` (idempotente)

### E. DTOs e Validações
- [ ] `src/modules/products/dto/create-product.dto.ts` — `salonId`, `name`, `price`, `brand?`, `stockQuantity?`, `description?`
- [ ] `src/modules/products/dto/update-product.dto.ts` — `PartialType` para atualizações
- [ ] `src/modules/products/dto/adjust-stock.dto.ts` — `quantity` (positivo para adicionar, negativo para remover)
- [ ] Validations: `IsUUID`, `IsString`, `IsNumber`, `Min(0)`, `MaxLength(100)` para `name`, `MaxLength(50)` para `brand`

### F. Service, Controller e Endpoints
- [ ] Criar `ProductsModule`, `ProductsService`, `ProductsController` (ou integrar em `SalonsModule`)
- [ ] Endpoints recomendados (aninhados sob salões):
  - `POST   /api/salons/:salonId/products` — Criar produto (owner/admin)
  - `GET    /api/salons/:salonId/products` — Listar produtos do salão
  - `GET    /api/salons/:salonId/products/:id` — Detalhes do produto
  - `PUT    /api/salons/:salonId/products/:id` — Atualizar produto (owner/admin)
  - `PATCH  /api/salons/:salonId/products/:id/stock` — Ajustar estoque (owner/admin/worker)
  - `PATCH  /api/salons/:salonId/products/:id/deactivate` — Desativar produto (soft-delete)
  - `DELETE /api/salons/:salonId/products/:id` — Remover permanentemente (restrito)

### G. Business Rules e Regras de Negócio
- [ ] Controle de estoque: ao vincular produto a agendamento via `appointment_products`, decrementar `stock_quantity`
- [ ] Permitir estoque negativo ou bloquear? (definir política: alertar ou impedir venda quando estoque = 0)
- [ ] Histórico de preço mantido em `appointment_products` (não alterar registros históricos)
- [ ] Alertas de estoque baixo (ex.: notificar owner/admin quando `stock_quantity` < limite configurável)

### H. Tests
- [ ] Unit tests para `ProductsService` (criar, atualizar, ajustar estoque, listar)
- [ ] E2E tests para endpoints CRUD e ajuste de estoque
- [ ] Testar validações: price negativo, stock negativo, brand muito longo
- [ ] Testar lógica de decremento de estoque ao criar `appointment_product`

### I. Documentação e Swagger
- [ ] Documentar endpoints de `Products` com `@ApiTags('Products')` ou `@ApiTags('Salons')`
- [ ] Adicionar exemplos de requisição/resposta para ajuste de estoque
- [ ] Documentar cenários de erro (400, 403, 404, 409 para conflito de estoque)

### J. Checklist de Aceitação
- [ ] Migration aplicada com sucesso
- [ ] Endpoints CRUD e ajuste de estoque funcionando com validações
- [ ] Seeds de desenvolvimento carregados com produtos exemplares
- [ ] Controle de estoque integrado com `appointment_products`
- [ ] Testes unitários e e2e para os fluxos principais passando


## 🧾 Schema: Appointments (Lista de Tarefas)

Checklist para a tabela `appointments`, que gerencia os agendamentos de serviços em cada salão.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `salon_id` UUID FK -> `salons.id`
  - `client_id` UUID FK -> `users.id`
  - `worker_id` UUID FK -> `users.id` (NULLABLE)
  - `scheduled_at` DATETIME NOT NULL
  - `total_duration_minutes` INTEGER NOT NULL
  - `total_price` DECIMAL(10,2) NOT NULL
  - `status` ENUM('scheduled','confirmed','in_progress','completed','cancelled') DEFAULT 'scheduled'
  - `notes` TEXT NULLABLE
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- [ ] Constraints: `NOT NULL` em campos obrigatórios; CHECK(total_price >= 0), CHECK(total_duration_minutes > 0)
- [ ] Índices: `INDEX(salon_id, scheduled_at)`, `INDEX(client_id)`, `INDEX(worker_id)`, `INDEX(status)`

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/appointment.entity.ts` com colunas em snake_case
- [ ] Mapear relacionamentos:
  - `ManyToOne` -> `Salon`
  - `ManyToOne` -> `User` (client)
  - `ManyToOne` -> `User` (worker, nullable)
  - `OneToMany` -> `AppointmentService` (pivot)
  - `OneToMany` -> `AppointmentProduct` (pivot)
- [ ] Aplicar validações: datas futuras, status válidos

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateAppointments` e revisar SQL
- [ ] Garantir FKs com `ON DELETE CASCADE` para `salon_id`, `ON DELETE SET NULL` para `worker_id`, `ON DELETE RESTRICT` para `client_id`
- [ ] Criar índices compostos para otimizar queries de listagem por salão e data

### D. Seeds e Dados de Desenvolvimento
- [ ] Criar seed com agendamentos de exemplo para `salon_default` (passados e futuros)
- [ ] Adicionar em `docs/seeds/seed_appointments.sql` ou `scripts/seed-appointments.ts` (idempotente)

### E. DTOs e Validações
- [ ] `src/modules/appointments/dto/create-appointment.dto.ts` — `salonId`, `clientId`, `workerId?`, `scheduledAt`, `serviceIds[]`, `productIds[]?`
- [ ] `src/modules/appointments/dto/update-appointment.dto.ts` — `PartialType` para campos editáveis
- [ ] `src/modules/appointments/dto/update-status.dto.ts` — `status` (validar transições válidas)
- [ ] `src/modules/appointments/dto/list-appointments.dto.ts` — `page`, `limit`, `status?`, `dateFrom?`, `dateTo?`, `workerId?`, `clientId?`
- [ ] Validations: `IsUUID`, `IsDateString`, `IsEnum`, `IsArray`, `ArrayMinSize(1)` para `serviceIds`

### F. Service, Controller e Endpoints
- [ ] Criar `AppointmentsModule`, `AppointmentsService`, `AppointmentsController`
- [ ] Endpoints recomendados:
  - `POST   /api/salons/:salonId/appointments` — Criar agendamento (client ou admin/owner)
  - `GET    /api/salons/:salonId/appointments` — Listar agendamentos do salão (filtros: status, data, worker)
  - `GET    /api/salons/:salonId/appointments/:id` — Detalhes do agendamento
  - `PUT    /api/salons/:salonId/appointments/:id` — Atualizar agendamento (client/admin/owner)
  - `PATCH  /api/salons/:salonId/appointments/:id/status` — Atualizar status (worker/admin/owner)
  - `DELETE /api/salons/:salonId/appointments/:id` — Cancelar agendamento (soft-delete via status ou hard delete)
  - `GET    /api/users/me/appointments` — Listar agendamentos do usuário logado (como client ou worker)

### G. Business Rules e Regras de Negócio
- [ ] Ao criar agendamento, calcular automaticamente `total_duration_minutes` somando durações dos serviços
- [ ] Calcular automaticamente `total_price` somando preços de serviços e produtos
- [ ] Validar disponibilidade: verificar se `worker_id` já tem agendamento no horário (`scheduled_at` + duração)
- [ ] Validar horário de funcionamento do salão (`business_hours`)
- [ ] Transições de status válidas: `scheduled` → `confirmed` → `in_progress` → `completed` ou `cancelled`
- [ ] Enviar notificações automáticas (email/WhatsApp) ao criar/atualizar agendamento
- [ ] Decrementar estoque de produtos ao confirmar/completar agendamento

### H. Tests
- [ ] Unit tests para `AppointmentsService` (criar, calcular totais, validar disponibilidade, atualizar status)
- [ ] E2E tests para endpoints CRUD e transições de status
- [ ] Testar validações: agendamento no passado, horário fora do expediente, conflito de horário
- [ ] Testar permissões: client só vê/edita seus próprios agendamentos

### I. Documentação e Swagger
- [ ] Documentar endpoints de `Appointments` com `@ApiTags('Appointments')`
- [ ] Adicionar exemplos de criação de agendamento com múltiplos serviços/produtos
- [ ] Documentar fluxo de estados e regras de transição
- [ ] Documentar cenários de erro (409 para conflito de horário, 400 para validações)

### J. Checklist de Aceitação
- [ ] Migration aplicada com sucesso
- [ ] Endpoints CRUD funcionando com cálculo automático de totais
- [ ] Validação de disponibilidade e horário de funcionamento implementada
- [ ] Transições de status controladas e validadas
- [ ] Integração com `appointment_services` e `appointment_products` funcionando
- [ ] Testes unitários e e2e para os fluxos principais passando


## 🧾 Schema: AppointmentServices (Lista de Tarefas)

Checklist para a tabela pivot `appointment_services`, que registra os serviços incluídos em cada agendamento.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `appointment_id` UUID FK -> `appointments.id`
  - `service_id` UUID FK -> `services.id`
  - `price` DECIMAL(10,2) NOT NULL
  - `duration_minutes` INTEGER NOT NULL
- [ ] Constraints: `NOT NULL` em todos os campos; CHECK(price >= 0), CHECK(duration_minutes > 0)
- [ ] Índices: `INDEX(appointment_id)`, `INDEX(service_id)`, `UNIQUE(appointment_id, service_id)` opcional para evitar duplicatas

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/appointment-service.entity.ts` com colunas em snake_case
- [ ] Mapear relacionamentos:
  - `ManyToOne` -> `Appointment`
  - `ManyToOne` -> `Service`
- [ ] **Importante:** Armazenar `price` e `duration_minutes` do momento da criação (snapshot) para histórico imutável

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateAppointmentServices` e revisar SQL
- [ ] Garantir FKs com `ON DELETE CASCADE` para `appointment_id` e `ON DELETE RESTRICT` para `service_id`
- [ ] Criar índices para otimizar queries de histórico e relatórios

### D. Seeds e Dados de Desenvolvimento
- [ ] Criar seed vinculando serviços aos agendamentos de exemplo (já criados em `seed_appointments`)
- [ ] Adicionar em `docs/seeds/seed_appointment_services.sql` ou integrar em `seed-appointments.ts` (idempotente)

### E. DTOs e Validações
- [ ] `src/modules/appointments/dto/appointment-service-item.dto.ts` — `serviceId` (usado dentro de `create-appointment.dto`)
- [ ] Validations: `IsUUID`, validar que `serviceId` existe e pertence ao `salonId` do agendamento
- [ ] Response DTO: incluir detalhes do serviço (nome, price, duration) ao retornar agendamento

### F. Service, Controller e Endpoints
- [ ] **Não criar endpoints isolados** — a gestão de `appointment_services` deve ser feita através de `AppointmentsService`
- [ ] No `AppointmentsService.create()`:
  - Receber array de `serviceIds` no DTO
  - Buscar cada `Service` do banco para obter `price` e `duration_minutes` atuais
  - Criar registros em `appointment_services` com os valores snapshot
  - Calcular `total_price` e `total_duration_minutes` do `Appointment`
- [ ] No `AppointmentsService.findOne()`:
  - Retornar agendamento com lista de serviços (`services: [{ id, name, price, durationMinutes }]`)

### G. Business Rules e Regras de Negócio
- [ ] **Snapshot de preço/duração:** Sempre armazenar valores atuais do `Service` no momento da criação do agendamento
- [ ] **Imutabilidade:** Não permitir edição de `appointment_services` após criação (apenas cancelamento do agendamento inteiro)
- [ ] **Validação:** Garantir que todos os `serviceIds` pertencem ao mesmo `salonId` do agendamento
- [ ] **Cálculo de totais:** Somar `price` e `duration_minutes` de todos os serviços para atualizar `Appointment.total_*`

### H. Tests
- [ ] Unit tests para criação de `appointment_services` dentro de `AppointmentsService.create()`
- [ ] Testar snapshot de preço: criar agendamento, alterar preço do serviço, verificar que histórico permanece inalterado
- [ ] Testar cálculo de totais com múltiplos serviços
- [ ] Testar validação: tentar adicionar serviço de outro salão ao agendamento

### I. Documentação e Swagger
- [ ] Documentar estrutura de `serviceIds[]` no DTO de criação de agendamento
- [ ] Adicionar exemplo de response mostrando serviços expandidos com preço/duração históricos
- [ ] Documentar que preço/duração são imutáveis após criação

### J. Checklist de Aceitação
- [ ] Migration aplicada com sucesso
- [ ] Criação de agendamento com múltiplos serviços funcionando
- [ ] Snapshot de preço/duração armazenado corretamente
- [ ] Cálculo de totais do agendamento preciso
- [ ] Histórico de serviços preservado mesmo após alterações na tabela `services`
- [ ] Testes unitários cobrindo snapshot e cálculos passando


## 🧾 Schema: AppointmentProducts (Lista de Tarefas)

Checklist para a tabela pivot `appointment_products`, que registra os produtos utilizados ou vendidos em cada agendamento.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `appointment_id` UUID FK -> `appointments.id`
  - `product_id` UUID FK -> `products.id`
  - `quantity` INTEGER NOT NULL
  - `unit_price` DECIMAL(10,2) NOT NULL
  - `total_price` DECIMAL(10,2) NOT NULL
- [ ] Constraints: `NOT NULL` em todos os campos; CHECK(quantity > 0), CHECK(unit_price >= 0), CHECK(total_price >= 0)
- [ ] Índices: `INDEX(appointment_id)`, `INDEX(product_id)`, `UNIQUE(appointment_id, product_id)` opcional para evitar duplicatas

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/appointment-product.entity.ts` com colunas em snake_case
- [ ] Mapear relacionamentos:
  - `ManyToOne` -> `Appointment`
  - `ManyToOne` -> `Product`
- [ ] **Importante:** Armazenar `unit_price` do momento da criação (snapshot) para histórico imutável
- [ ] Calcular automaticamente `total_price` = `quantity` * `unit_price` (pode ser via hook `@BeforeInsert`)

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateAppointmentProducts` e revisar SQL
- [ ] Garantir FKs com `ON DELETE CASCADE` para `appointment_id` e `ON DELETE RESTRICT` para `product_id`
- [ ] Criar índices para otimizar queries de histórico, relatórios e análise de vendas

### D. Seeds e Dados de Desenvolvimento
- [ ] Criar seed vinculando produtos aos agendamentos de exemplo (já criados em `seed_appointments`)
- [ ] Adicionar em `docs/seeds/seed_appointment_products.sql` ou integrar em `seed-appointments.ts` (idempotente)

### E. DTOs e Validações
- [ ] `src/modules/appointments/dto/appointment-product-item.dto.ts` — `productId`, `quantity` (usado dentro de `create-appointment.dto`)
- [ ] Validations: `IsUUID`, `IsInt`, `Min(1)` para `quantity`, validar que `productId` existe e pertence ao `salonId` do agendamento
- [ ] Response DTO: incluir detalhes do produto (nome, brand, unitPrice, quantity, totalPrice) ao retornar agendamento

### F. Service, Controller e Endpoints
- [ ] **Não criar endpoints isolados** — a gestão de `appointment_products` deve ser feita através de `AppointmentsService`
- [ ] No `AppointmentsService.create()`:
  - Receber array de `{ productId, quantity }` no DTO
  - Buscar cada `Product` do banco para obter `price` atual
  - Criar registros em `appointment_products` com valores snapshot (`unit_price`, `quantity`, `total_price`)
  - Somar `total_price` de todos os produtos ao `total_price` do `Appointment`
- [ ] No `AppointmentsService.findOne()`:
  - Retornar agendamento com lista de produtos (`products: [{ id, name, brand, quantity, unitPrice, totalPrice }]`)

### G. Business Rules e Regras de Negócio
- [ ] **Snapshot de preço:** Sempre armazenar `unit_price` atual do `Product` no momento da criação do agendamento
- [ ] **Imutabilidade:** Não permitir edição de `appointment_products` após criação (apenas cancelamento do agendamento inteiro)
- [ ] **Validação:** Garantir que todos os `productIds` pertencem ao mesmo `salonId` do agendamento
- [ ] **Cálculo de totais:** Somar `total_price` de todos os produtos para atualizar `Appointment.total_price` (além dos serviços)
- [ ] **Controle de estoque:** Decrementar `Product.stock_quantity` ao criar/confirmar agendamento:
  - Validar se há estoque suficiente antes de criar `appointment_product`
  - Incrementar estoque de volta se agendamento for cancelado (opcional: implementar política de rollback)
  - Considerar status do agendamento: decrementar apenas em `confirmed` ou `completed`?
- [ ] **Alertas de estoque:** Notificar owner/admin se produto atingir estoque baixo após venda

### H. Tests
- [ ] Unit tests para criação de `appointment_products` dentro de `AppointmentsService.create()`
- [ ] Testar snapshot de preço: criar agendamento, alterar preço do produto, verificar que histórico permanece inalterado
- [ ] Testar cálculo de totais com múltiplos produtos e quantidades variadas
- [ ] Testar validação de estoque: tentar criar agendamento com quantidade maior que `stock_quantity` disponível
- [ ] Testar decremento de estoque: criar agendamento e verificar que `Product.stock_quantity` foi reduzido corretamente
- [ ] Testar rollback de estoque ao cancelar agendamento (se implementado)
- [ ] Testar validação: tentar adicionar produto de outro salão ao agendamento

### I. Documentação e Swagger
- [ ] Documentar estrutura de `products: [{ productId, quantity }]` no DTO de criação de agendamento
- [ ] Adicionar exemplo de response mostrando produtos expandidos com preço unitário/total históricos
- [ ] Documentar que `unit_price` e `total_price` são imutáveis após criação
- [ ] Documentar regras de controle de estoque e validações de quantidade disponível
- [ ] Adicionar exemplos de cenários de erro (409 para estoque insuficiente, 400 para quantidade inválida)

### J. Checklist de Aceitação
- [ ] Migration aplicada com sucesso
- [ ] Criação de agendamento com múltiplos produtos e quantidades funcionando
- [ ] Snapshot de preço unitário armazenado corretamente
- [ ] Cálculo de `total_price` por produto (quantity * unit_price) preciso
- [ ] Cálculo de `total_price` do agendamento incluindo produtos e serviços
- [ ] Controle de estoque integrado: decremento ao criar/confirmar agendamento
- [ ] Validação de estoque disponível antes de permitir criação
- [ ] Histórico de produtos preservado mesmo após alterações na tabela `products`
- [ ] Testes unitários cobrindo snapshot, cálculos e controle de estoque passando


## 🧾 Schema: Messages (Lista de Tarefas)

Checklist para a tabela `messages`, que armazena o histórico de mensagens enviadas pelo sistema.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `salon_id` UUID FK -> `salons.id`
  - `recipient_id` UUID FK -> `users.id`
  - `type` ENUM('whatsapp','email','sms','messenger') NOT NULL
  - `subject` VARCHAR(255) NULLABLE (apenas para email)
  - `content` TEXT NOT NULL
  - `status` ENUM('pending','sent','delivered','failed') DEFAULT 'pending'
  - `metadata` JSON NULLABLE (templateId, providerId, errorDetails, etc.)
  - `scheduled_for` DATETIME NULLABLE
  - `sent_at` DATETIME NULLABLE
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- [ ] Constraints: `NOT NULL` em campos obrigatórios; CHECK para validar `type` e `status`
- [ ] Índices: `INDEX(salon_id, recipient_id)`, `INDEX(status)`, `INDEX(scheduled_for)`, `INDEX(sent_at)`

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/message.entity.ts` com colunas em snake_case
- [ ] Mapear relacionamentos:
  - `ManyToOne` -> `Salon`
  - `ManyToOne` -> `User` (recipient)
- [ ] Enum types para `type` e `status` (criar em `src/common/enums/message-type.enum.ts` e `message-status.enum.ts`)
- [ ] Validar formato de `metadata` JSON (pode conter: `templateId`, `providerId`, `messageId`, `errorDetails`, etc.)

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateMessages` e revisar SQL
- [ ] Garantir FKs com `ON DELETE CASCADE` para `salon_id` e `recipient_id`
- [ ] Criar índices compostos para otimizar queries de listagem, pendências e agendamentos

### D. Seeds e Dados de Desenvolvimento
- [ ] Criar seed com mensagens de exemplo para `salon_default` (pendentes, enviadas, falhadas)
- [ ] Adicionar em `docs/seeds/seed_messages.sql` ou `scripts/seed-messages.ts` (idempotente)

### E. DTOs e Validações
- [ ] `src/modules/messages/dto/create-message.dto.ts` — `salonId`, `recipientId`, `type`, `subject?`, `content`, `scheduledFor?`, `metadata?`
- [ ] `src/modules/messages/dto/update-message-status.dto.ts` — `status`, `sentAt?`, `metadata?` (para atualizar após envio)
- [ ] `src/modules/messages/dto/list-messages.dto.ts` — `page`, `limit`, `status?`, `type?`, `dateFrom?`, `dateTo?`, `recipientId?`
- [ ] `src/modules/messages/dto/send-bulk-message.dto.ts` — `salonId`, `recipientIds[]`, `type`, `content`, `subject?`, `scheduledFor?`
- [ ] Validations: `IsUUID`, `IsEnum`, `IsString`, `IsDateString`, `IsOptional`, `MaxLength(255)` para `subject`

### F. Service, Controller e Endpoints
- [ ] Criar `MessagesModule`, `MessagesService`, `MessagesController`
- [ ] Endpoints recomendados:
  - `POST   /api/salons/:salonId/messages` — Criar/agendar mensagem (admin/owner)
  - `POST   /api/salons/:salonId/messages/bulk` — Enviar mensagem em massa (admin/owner)
  - `GET    /api/salons/:salonId/messages` — Listar histórico de mensagens do salão
  - `GET    /api/salons/:salonId/messages/:id` — Detalhes de uma mensagem
  - `PATCH  /api/salons/:salonId/messages/:id/status` — Atualizar status (interno/webhook)
  - `DELETE /api/salons/:salonId/messages/:id` — Cancelar mensagem agendada (apenas se `status = 'pending'`)
  - `GET    /api/users/me/messages` — Listar mensagens recebidas pelo usuário logado

### G. Business Rules e Regras de Negócio
- [ ] **Agendamento:** Se `scheduled_for` for definido, não enviar imediatamente (processar via job/cron)
- [ ] **Envio imediato:** Se `scheduled_for` for NULL, marcar como `pending` e processar em fila (background job)
- [ ] **Validação de destinatário:** Verificar se `recipient_id` tem contato válido (phone para WhatsApp/SMS, email para Email)
- [ ] **Transições de status válidas:** `pending` → `sent` → `delivered` ou `failed`
- [ ] **Retry logic:** Implementar reenvio automático para mensagens `failed` (máx. 3 tentativas)
- [ ] **Templates:** Suportar templates com variáveis (ex.: `{nome}`, `{horario}`, `{servico}`) via `metadata.templateId`
- [ ] **Rate limiting:** Limitar envio por salão/período para evitar spam
- [ ] **Webhooks:** Atualizar status via webhook de provedores (WhatsApp Business API, SendGrid, Twilio, etc.)

### H. Tests
- [ ] Unit tests para `MessagesService` (criar, agendar, processar fila, atualizar status)
- [ ] E2E tests para endpoints CRUD e envio em massa
- [ ] Testar validações: tipo inválido, destinatário sem contato, agendamento no passado
- [ ] Testar job de processamento de mensagens pendentes/agendadas
- [ ] Testar retry logic para mensagens falhadas
- [ ] Mock de provedores externos (WhatsApp, Email, SMS) para testes isolados

### I. Documentação e Swagger
- [ ] Documentar endpoints de `Messages` com `@ApiTags('Messages')`
- [ ] Adicionar exemplos de criação com templates e variáveis
- [ ] Documentar estrutura de `metadata` (campos opcionais e uso de templates)
- [ ] Documentar fluxo de estados e webhooks de atualização de status
- [ ] Adicionar exemplos de envio em massa e agendamento

### J. Checklist de Aceitação
- [ ] Migration aplicada com sucesso
- [ ] Endpoints CRUD funcionando com validações e permissões
- [ ] Envio imediato e agendado de mensagens funcionando via job/cron
- [ ] Integração com pelo menos um provedor (WhatsApp ou Email) implementada
- [ ] Sistema de templates com variáveis funcionando
- [ ] Atualização de status via webhook implementada
- [ ] Retry logic para mensagens falhadas funcionando
- [ ] Testes unitários e e2e para os fluxos principais passando


## 🧾 Schema: RefreshTokens (Lista de Tarefas)

Checklist para a tabela `refresh_tokens`, que gerencia tokens JWT para renovação de sessões.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `user_id` UUID FK -> `users.id`
  - `token` TEXT UNIQUE NOT NULL (hash do refresh token)
  - `expires_at` DATETIME NOT NULL
  - `is_revoked` BOOLEAN DEFAULT FALSE
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- [ ] Constraints: `UNIQUE(token)`, `NOT NULL` em campos obrigatórios
- [ ] Índices: `INDEX(user_id)`, `UNIQUE(token)`, `INDEX(expires_at)`, `INDEX(is_revoked)`

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/refresh-token.entity.ts` com colunas em snake_case
- [ ] Mapear relacionamentos:
  - `ManyToOne` -> `User`
- [ ] Não expor `token` em respostas da API (apenas usado internamente para validação)
- [ ] Implementar método helper `isValid()` que verifica `!is_revoked && expires_at > now()`

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateRefreshTokens` e revisar SQL
- [ ] Garantir FK com `ON DELETE CASCADE` para `user_id`
- [ ] Criar índices para otimizar queries de validação e limpeza

### D. Seeds e Dados de Desenvolvimento
- [ ] Não criar seeds (tokens devem ser gerados dinamicamente durante login)
- [ ] Adicionar script de limpeza: `scripts/clean-expired-tokens.ts` para remover tokens expirados (job agendado)

### E. DTOs e Validações
- [ ] `src/modules/auth/dto/refresh-token.dto.ts` — `refreshToken` (string do token para renovação)
- [ ] `src/modules/auth/dto/auth-response.dto.ts` — `accessToken`, `refreshToken`, `expiresIn`, `tokenType`
- [ ] Validations: `IsString`, `IsNotEmpty` para `refreshToken`
- [ ] Response DTO não deve expor dados sensíveis da tabela (apenas retornar novo par de tokens)

### F. Service, Controller e Endpoints
- [ ] Integrar em `AuthModule`, `AuthService`, `AuthController` (já existente)
- [ ] Endpoints recomendados:
  - `POST /api/auth/login` — Retornar access token + refresh token
  - `POST /api/auth/refresh` — Renovar tokens usando refresh token válido
  - `POST /api/auth/logout` — Revogar refresh token do usuário
  - `POST /api/auth/logout-all` — Revogar todos os refresh tokens do usuário (opcional)
- [ ] Método `AuthService.generateTokens(user)` — Gerar par access + refresh tokens
- [ ] Método `AuthService.refreshTokens(refreshToken)` — Validar e gerar novos tokens
- [ ] Método `AuthService.revokeToken(token)` — Marcar `is_revoked = true`

### G. Business Rules e Regras de Negócio
- [ ] **Geração de tokens:** Ao fazer login, criar novo registro em `refresh_tokens` com validade de 7 dias
- [ ] **Rotação de tokens:** Ao usar refresh token, revogar o antigo e gerar novo par (previne reutilização)
- [ ] **Validação:** Verificar se token não está revogado e não expirou antes de renovar
- [ ] **Limite por usuário:** Opcional - limitar número de refresh tokens ativos por usuário (ex.: máx. 5 dispositivos)
- [ ] **Limpeza automática:** Job agendado (cron) para deletar tokens expirados há mais de 30 dias
- [ ] **Segurança:** Armazenar hash do refresh token (não plain text), usar bcrypt ou similar
- [ ] **Revogação:** Logout deve revogar o refresh token específico; logout-all revoga todos os tokens do usuário

### H. Tests
- [ ] Unit tests para `AuthService` (gerar tokens, renovar, revogar, validar expiração)
- [ ] E2E tests para fluxo completo: login → refresh → logout
- [ ] Testar cenários de erro: token expirado, token revogado, token inválido, token de outro usuário
- [ ] Testar rotação de tokens: usar refresh token duas vezes deve falhar na segunda
- [ ] Testar limite de tokens por usuário (se implementado)

### I. Documentação e Swagger
- [ ] Documentar endpoints de autenticação com `@ApiTags('Auth')`
- [ ] Adicionar exemplos de fluxo de renovação de tokens
- [ ] Documentar estrutura de resposta com `accessToken` e `refreshToken`
- [ ] Documentar tempo de expiração padrão (access: 15min, refresh: 7 dias)
- [ ] Adicionar exemplos de cenários de erro (401 para token inválido/expirado)

### J. Checklist de Aceitação
- [ ] Migration aplicada com sucesso
- [ ] Login gerando par de tokens (access + refresh) funcionando
- [ ] Endpoint de refresh renovando tokens corretamente
- [ ] Rotação de tokens implementada (revoga antigo ao gerar novo)
- [ ] Logout revogando refresh token específico
- [ ] Job de limpeza de tokens expirados funcionando
- [ ] Validações de segurança implementadas (hash, expiração, revogação)
- [ ] Testes unitários e e2e para os fluxos principais passando





# 📋 TODO List - Módulo de Mensageria

## 🏗️ Fase 1: Estrutura Base (Fundação)

### 1. ✅ Estrutura do Módulo
- [ ] Criar pasta `src/messaging/`
- [ ] Criar subpastas: `interfaces/`, `adapters/`, `services/`, `controllers/`, `dto/`, `entities/`
- [ ] Criar `messaging.module.ts` com imports necessários

### 2. ✅ Interfaces dos Repository Adapters
- [ ] Criar `interfaces/IWhatsAppAdapter.ts` com métodos: `send()`, `getStatus()`, `validateCredentials()`
- [ ] Criar `interfaces/IEmailAdapter.ts` com métodos similares + suporte a anexos
- [ ] Criar `interfaces/ISmsAdapter.ts` com métodos básicos de envio
- [ ] Criar `interfaces/IMessengerAdapter.ts` com métodos do Facebook API
- [ ] Criar interface base `IMessageAdapter` com métodos comuns

### 3. ✅ DTOs e Validações
- [ ] Criar `dto/send-whatsapp.dto.ts` (to, message, mediaUrl?, mediaType?)
- [ ] Criar `dto/send-email.dto.ts` (to, subject, body, html?, attachments?)
- [ ] Criar `dto/send-sms.dto.ts` (to, message)
- [ ] Criar `dto/send-messenger.dto.ts` (recipientId, message, quickReplies?)
- [ ] Criar `dto/message-response.dto.ts` (id, status, timestamp, provider)

### 4. ✅ Entidades do Banco de Dados
- [ ] Criar `entities/message.entity.ts` (id, type, recipient, content, status, providerId, userId, createdAt)
- [ ] Criar `entities/message-log.entity.ts` (id, messageId, event, details, timestamp)
- [ ] Adicionar migrations com TypeORM

## 🔌 Fase 2: Implementação dos Adapters

### 5. 📱 WhatsApp Adapter (Z-API)
- [ ] Instalar dependência: `npm install axios`
- [ ] Criar `adapters/whatsapp/zapi-whatsapp.adapter.ts`
- [ ] Implementar método `send()` para texto
- [ ] Implementar envio de imagens
- [ ] Implementar envio de documentos
- [ ] Adicionar variáveis no `.env`: `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`
- [ ] Criar método `getStatus()` para verificar conexão

### 6. 📧 Email Adapter (Resend)
- [ ] Instalar: `npm install resend`
- [ ] Criar `adapters/email/resend-email.adapter.ts`
- [ ] Implementar envio de email simples
- [ ] Implementar suporte a HTML
- [ ] Implementar suporte a anexos
- [ ] Adicionar variável: `RESEND_API_KEY`

### 7. 💬 SMS Adapter (TotalVoice)
- [ ] Instalar: `npm install totalvoice-node` ou usar `axios`
- [ ] Criar `adapters/sms/totalvoice-sms.adapter.ts`
- [ ] Implementar envio básico de SMS
- [ ] Adicionar variáveis: `TOTALVOICE_ACCESS_TOKEN`

### 8. 📲 Messenger Adapter (Facebook Graph API)
- [ ] Instalar: `npm install axios`
- [ ] Criar `adapters/messenger/facebook-messenger.adapter.ts`
- [ ] Implementar envio de mensagem via Graph API
- [ ] Implementar suporte a quick replies e botões
- [ ] Adicionar variáveis: `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_VERIFY_TOKEN`

## 🎯 Fase 3: Camada de Serviços

### 9. 🏭 Serviço Unificado de Mensageria
- [ ] Criar `messaging.service.ts`
- [ ] Implementar injeção de dependência para todos os adapters
- [ ] Criar factory pattern para selecionar adapter correto
- [ ] Implementar método `sendWhatsApp(dto)`
- [ ] Implementar método `sendEmail(dto)`
- [ ] Implementar método `sendSms(dto)`
- [ ] Implementar método `sendMessenger(dto)`
- [ ] Salvar todas as mensagens no banco de dados
- [ ] Adicionar logs com Winston/Pino

### 10. 🎮 Controller de Mensagens
- [ ] Criar `messaging.controller.ts`
- [ ] Criar endpoint `POST /api/messages/whatsapp` (protegido com JWT)
- [ ] Criar endpoint `POST /api/messages/email` (protegido com JWT)
- [ ] Criar endpoint `POST /api/messages/sms` (protegido com JWT)
- [ ] Criar endpoint `POST /api/messages/messenger` (protegido com JWT)
- [ ] Criar endpoint `GET /api/messages/history` (listagem com paginação)
- [ ] Criar endpoint `GET /api/messages/:id` (detalhes de uma mensagem)

## ⚡ Fase 4: Processamento Assíncrono

### 11. 🔄 Sistema de Filas (BullMQ + Redis)
- [ ] Instalar: `npm install @nestjs/bull bullmq ioredis`
- [ ] Configurar Redis (Docker ou local)
- [ ] Criar fila `whatsapp-queue`
- [ ] Criar fila `email-queue`
- [ ] Criar fila `sms-queue`
- [ ] Criar fila `messenger-queue`
- [ ] Criar processors para cada fila
- [ ] Implementar jobs com retry automático

### 12. 🛡️ Tratamento de Erros e Resiliência
- [ ] Implementar retry automático (3 tentativas)
- [ ] Implementar circuit breaker para APIs externas
- [ ] Criar logs detalhados de erros
- [ ] Implementar fallback para provedores alternativos
- [ ] Adicionar timeout nas requisições (30s)

## ✅ Fase 5: Testes

### 13. 🧪 Testes Unitários dos Adapters
- [ ] Testar `ZApiWhatsAppAdapter` com API mockada
- [ ] Testar `ResendEmailAdapter` com API mockada
- [ ] Testar `TotalVoiceSmsAdapter` com API mockada
- [ ] Testar `FacebookMessengerAdapter` com API mockada
- [ ] Testar validações dos DTOs

### 14. 🔬 Testes E2E
- [ ] Testar fluxo completo de envio via WhatsApp
- [ ] Testar fluxo completo de envio via Email
- [ ] Testar autenticação nos endpoints
- [ ] Testar cenários de erro (credenciais inválidas, timeout, etc)

## 📚 Fase 6: Documentação e Features Extras

### 15. 📖 Documentação Swagger
- [ ] Adicionar `@ApiTags('Messaging')` no controller
- [ ] Documentar todos os endpoints com `@ApiOperation`
- [ ] Adicionar exemplos de request/response
- [ ] Documentar códigos de erro possíveis

### 16. 📝 Sistema de Templates
- [ ] Criar entidade `MessageTemplate`
- [ ] Permitir variáveis dinâmicas: `{{nome}}`, `{{data}}`, etc
- [ ] Criar endpoint para gerenciar templates
- [ ] Implementar parse de templates antes do envio

### 17. 🔔 Webhooks para Status de Entrega
- [ ] Criar endpoint `POST /api/webhooks/whatsapp/status`
- [ ] Criar endpoint `POST /api/webhooks/email/status`
- [ ] Atualizar status da mensagem no banco (entregue, lido, falhou)
- [ ] Registrar eventos no `MessageLog`

### 18. 🚦 Rate Limiting
- [ ] Instalar: `npm install @nestjs/throttler`
- [ ] Configurar limite por usuário (ex: 100 msg/hora)
- [ ] Configurar limite global (ex: 1000 msg/hora)
- [ ] Criar sistema de cotas por plano de usuário

### 19. 📊 Dashboard de Estatísticas
- [ ] Criar endpoint `GET /api/messages/stats`
- [ ] Retornar: total enviado, taxa de sucesso, falhas
- [ ] Agrupar por canal (WhatsApp, Email, SMS, Messenger)
- [ ] Adicionar filtros por período (hoje, semana, mês)
- [ ] Calcular custos estimados por canal

### 20. 📄 Documentação Final
- [ ] Criar `MESSAGING.md` com guia completo
- [ ] Documentar como trocar de provedor
- [ ] Adicionar exemplos de uso de cada adapter
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Criar guia de troubleshooting

---


## 🎯 Prioridade de Execução Sugerida:

1. **CRÍTICO** (Fazer primeiro): Fases 1, 2, 3
2. **IMPORTANTE**: Fases 4, 5
3. **DESEJÁVEL**: Fase 6

## 🛠️ Dependências Necessárias:

```bash
# Instalar todas de uma vez
npm install axios resend ioredis @nestjs/bull bullmq @nestjs/throttler
```

## 📐 Arquitetura de Repository Adapter - Benefícios:

✅ **Desacoplamento**: Troca de provedor sem alterar lógica de negócio  
✅ **Testabilidade**: Fácil criar mocks dos adapters  
✅ **Escalabilidade**: Adicionar novos canais sem modificar código existente  
✅ **Manutenibilidade**: Cada adapter é independente  
✅ **Flexibilidade**: Usar múltiplos provedores simultaneamente (fallback)

---

# Endpoints Disponíveis

## 🏠 Endpoints Principais
| Método | Endpoint            | Descrição Breve                         | Recebe (Body/Params)                          | Devolve (Response)                           |
|--------|---------------------|----------------------------------------|----------------------------------------------|---------------------------------------------|
| GET    | /api                | Status básico da API                   | Nenhum                                       | String: "Hello World!"                      |
| GET    | /api/health         | Health check com status do banco      | Nenhum                                       | JSON: { status, uptime, database }          |

## 🔐 Endpoints de Autenticação
| Método | Endpoint               | Descrição Breve                         | Recebe (Body/Params)                          | Devolve (Response)                           |
|--------|------------------------|----------------------------------------|----------------------------------------------|---------------------------------------------|
| POST   | /api/auth/register     | Registrar novo usuário                 | JSON: { "name", "email", "password" }        | JSON: { user, accessToken, refreshToken }   |
| POST   | /api/auth/login        | Fazer login                            | JSON: { "email", "password" }                | JSON: { user, accessToken, refreshToken }   |
| POST   | /api/auth/refresh      | Renovar access token                   | JSON: { "refreshToken" }                     | JSON: { user, accessToken, refreshToken }   |
| POST   | /api/auth/logout       | Logout (revoga refresh token)         | JSON: { "refreshToken" } + Authorization     | Status: 200                                 |
| POST   | /api/auth/logout-all   | Logout de todos os dispositivos        | Authorization Header                         | Status: 200                                 |
| GET    | /api/auth/profile      | Obter perfil do usuário               | Authorization Header                         | JSON: { id, name, email, createdAt }       |

## 📚 Documentação
| Método | Endpoint            | Descrição Breve                         | Recebe (Body/Params)                          | Devolve (Response)                           |
|--------|---------------------|----------------------------------------|----------------------------------------------|---------------------------------------------|
| GET    | /api/docs           | Documentação Swagger/OpenAPI           | Nenhum                                       | Interface Swagger                           |

## 🔑 Autenticação - Como Usar

### 1. Registrar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "email": "joao@email.com", "password": "minhasenha123"}'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@email.com", "password": "minhasenha123"}'
```

### 3. Acessar Endpoints Protegidos
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

### 4. Renovar Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "SEU_REFRESH_TOKEN_AQUI"}'
```

## ⚠️ Observações Importantes

- **Access Token**: Válido por 15 minutos
- **Refresh Token**: Válido por 7 dias  
- **Banco de Dados**: SQLite em desenvolvimento, PostgreSQL em produção
- **Senha**: Criptografada com bcrypt
- **Documentação Completa**: Disponível em `/api/docs` (Swagger)

# 🧰 Ferramentas e Tecnologias Implementadas

## 🏗️ Stack Atual
| Tecnologia         | Versão/Tipo              | Finalidade                             |
| ------------------ | ------------------------ | -------------------------------------- |
| **NestJS**         | v10                      | Framework backend principal            |
| **TypeScript**     | v5                       | Tipagem estática                       |
| **TypeORM**        | v0.3                     | ORM para banco de dados                |
| **SQLite**         | Local                    | Banco de desenvolvimento               |
| **PostgreSQL**     | Configurado              | Banco de produção                      |
| **JWT**            | Access + Refresh Tokens  | Sistema de autenticação                |
| **bcrypt**         | Hash                     | Criptografia de senhas                 |
| **Jest**           | Testes                   | Framework de testes                    |
| **Swagger**        | OpenAPI                  | Documentação automática                |

## 🚀 Ferramentas Recomendadas para Deploy

| Função          | Serviço                  | Observação                         |
| --------------- | ------------------------ | ---------------------------------- |
| Banco de Dados  | **Supabase / Neon.tech** | PostgreSQL grátis e confiável      |
| Deploy          | **Render / Railway.app** | Deploy backend gratuito            |
| Envios WhatsApp | **Z-API**                | Para implementação futura          |
| Envios E-mail   | **Resend / Brevo**       | Para implementação futura          |
| SMS             | **TotalVoice**           | Para implementação futura          |
| Mensageria      | **BullMQ + Redis**       | Para filas (implementação futura)  |
| Monitoramento   | **UptimeRobot**          | Verifica se a API está online      |

## 📊 Status do Projeto

### ✅ Implementado e Funcionando
- [x] Sistema de autenticação completo (JWT + Refresh Token)
- [x] Banco de dados multi-ambiente (SQLite + PostgreSQL)
- [x] Documentação automática (Swagger)
- [x] Testes unitários e e2e (21 testes passando)
- [x] Validação de dados de entrada
- [x] Proteção de rotas
- [x] Health checks

### 🚧 Próximos Passos Sugeridos
- [ ] Sistema de envio de WhatsApp
- [ ] Sistema de envio de E-mail
- [ ] Sistema de envio de SMS
- [ ] Rate limiting para APIs
- [ ] Logs estruturados
- [ ] Recuperação de senha
- [ ] Two-Factor Authentication (2FA)
- [ ] Módulos de negócio específicos

### 🏃‍♂️ Como Executar

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Testes
npm test                # Testes unitários
npm run test:e2e        # Testes end-to-end
npm run test:cov        # Cobertura de testes
```

**🌐 Servidor Local**: http://localhost:3000  
**📖 Documentação**: http://localhost:3000/api/docs
