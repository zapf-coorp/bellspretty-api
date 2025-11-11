# 📊 Database Schema - BellsPretty API v2.0

## 🎯 Visão Geral do Sistema

Sistema de gerenciamento de salões com agendamentos, histórico de serviços/produtos e envio automatizado de mensagens.

---

## 📐 Diagrama Entidade-Relacionamento Completo

```mermaid
erDiagram
    %% Core Entities
    USERS ||--o{ REFRESH_TOKENS : "has"
    USERS ||--o{ USER_SALON_ROLES : "works_in"
    
    %% Salon Management
    SALONS ||--o{ USER_SALON_ROLES : "employs"
    SALONS ||--o{ SERVICES : "offers"
    SALONS ||--o{ PRODUCTS : "sells"
    SALONS ||--o{ APPOINTMENTS : "schedules"
    SALONS ||--o{ MESSAGES : "sends"
    
    %% Appointments
    APPOINTMENTS }o--|| USERS : "booked_by"
    APPOINTMENTS ||--o{ APPOINTMENT_SERVICES : "includes"
    APPOINTMENTS ||--o{ APPOINTMENT_PRODUCTS : "uses"
    
    APPOINTMENT_SERVICES }o--|| SERVICES : "references"
    APPOINTMENT_PRODUCTS }o--|| PRODUCTS : "references"
    
    %% Messages
    MESSAGES }o--|| USERS : "sent_to"
    
    %% Roles
    USER_SALON_ROLES }o--|| ROLES : "has_role"
    
    USERS {
        uuid id PK
        string name
        string email UK
        string password
        string phone
        enum globalRole "super_admin, user"
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    ROLES {
        uuid id PK
        string name UK "owner, admin, worker, client"
        string description
        timestamp createdAt
    }
    
    SALONS {
        uuid id PK
        string name
        string slug UK
        string description
        string address
        string phone
        string email
    uuid owner_user_id FK -> users.id NULLABLE
        json businessHours
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    USER_SALON_ROLES {
        uuid id PK
        uuid userId FK
        uuid salonId FK
        uuid roleId FK
        boolean isActive
        timestamp createdAt
    }

    ROLES ||--o{ ROLE_PERMISSIONS : "grants"
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "used_by"

    PERMISSIONS {
        uuid id PK
        string name UK
        string description
        enum scope "global, salon"
        timestamp createdAt
        timestamp updatedAt
    }

    ROLE_PERMISSIONS {
        uuid id PK
        uuid roleId FK
        uuid permissionId FK
        timestamp createdAt
    }
    
    SERVICES {
        uuid id PK
        uuid salonId FK
        string name
        string description
        decimal price
        int durationMinutes
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    PRODUCTS {
        uuid id PK
        uuid salonId FK
        string name
        string description
        string brand
        decimal price
        int stockQuantity
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }
    
    APPOINTMENTS {
        uuid id PK
        uuid salonId FK
        uuid clientId FK
        uuid workerId FK
        datetime scheduledAt
        int totalDurationMinutes
        decimal totalPrice
        enum status "scheduled, confirmed, in_progress, completed, cancelled"
        text notes
        timestamp createdAt
        timestamp updatedAt
    }
    
    APPOINTMENT_SERVICES {
        uuid id PK
        uuid appointmentId FK
        uuid serviceId FK
        decimal price
        int durationMinutes
    }
    
    APPOINTMENT_PRODUCTS {
        uuid id PK
        uuid appointmentId FK
        uuid productId FK
        int quantity
        decimal unitPrice
        decimal totalPrice
    }
    
    MESSAGES {
        uuid id PK
        uuid salonId FK
        uuid recipientId FK
        enum type "whatsapp, email, sms, messenger"
        string subject
        text content
        enum status "pending, sent, delivered, failed"
        json metadata
        datetime scheduledFor
        datetime sentAt
        timestamp createdAt
    }
    
    REFRESH_TOKENS {
        uuid id PK
        uuid userId FK
        string token UK
        datetime expiresAt
        boolean isRevoked
        timestamp createdAt
    }
```

---

## 🗄️ Tabelas Detalhadas

### 1. **`users`** - Usuários do Sistema

Tabela central que armazena todos os usuários (donos, admins, workers, clientes).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `name` | VARCHAR(100) | NOT NULL | Nome completo |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email único |
| `password` | VARCHAR(255) | NOT NULL | Senha criptografada (bcrypt) |
| `phone` | VARCHAR(20) | NULLABLE | Telefone com DDD |
| `globalRole` | ENUM | DEFAULT 'user' | super_admin ou user |
| `isActive` | BOOLEAN | DEFAULT true | Status ativo/inativo |
| `createdAt` | TIMESTAMP | NOT NULL | Data de criação |
| `updatedAt` | TIMESTAMP | NOT NULL | Data de atualização |

**Índices:**
- `PK_users`: PRIMARY KEY em `id`
- `UQ_users_email`: UNIQUE em `email`
- `IDX_users_global_role`: INDEX em `globalRole`

**Regras:**
- `globalRole = 'super_admin'`: Acesso total ao sistema (gerenciar todos os salões)
- `globalRole = 'user'`: Acesso baseado em `user_salon_roles`

---

### 2. **`roles`** - Papéis no Sistema

Define os papéis que usuários podem ter dentro de um salão.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | Nome do papel |
| `description` | TEXT | NULLABLE | Descrição do papel |
| `createdAt` | TIMESTAMP | NOT NULL | Data de criação |

**Papéis Padrão:**
- `owner` - Dono do salão (acesso total ao salão)
- `admin` - Administrador (gerencia workers e agendamentos)
- `worker` - Profissional (executa serviços)
- `client` - Cliente (agenda serviços)

---

### 3. **`permissions`** - Permissões do Sistema

Tabela que define permissões granulares para RBAC (ex.: `appointments.create`, `salons.manage`).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `name` | VARCHAR(150) | UNIQUE, NOT NULL | Nome canônico da permissão (dot-notation) |
| `description` | TEXT | NULLABLE | Descrição legível |
| `scope` | ENUM | DEFAULT 'salon' | 'global' ou 'salon' (se precisa de contexto de salão) |
| `createdAt` | TIMESTAMP | NOT NULL | Data de criação |
| `updatedAt` | TIMESTAMP | NOT NULL | Data de atualização |

**Índices:**
- `UQ_permissions_name`: UNIQUE em `name`
- `IDX_permissions_scope`: INDEX em `scope`

**Regras:**
- Permissões definidas como strings canônicas (dot-notation) para facilitar verificação e agrupamento
- `scope = 'salon'` significa que o verificador de permissão deve receber um `salonId`

---

### 4. **`role_permissions`** - Mapeamento Role ↔ Permission

Pivot que conecta `roles` a `permissions`.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `roleId` | UUID | FOREIGN KEY, NOT NULL | Referência à role |
| `permissionId` | UUID | FOREIGN KEY, NOT NULL | Referência à permission |
| `createdAt` | TIMESTAMP | NOT NULL | Data de vínculo |

**Constraints:**
- `UNIQUE(roleId, permissionId)` - evita duplicatas
- `FK_role_permissions_roleId` → `roles.id` ON DELETE CASCADE
- `FK_role_permissions_permissionId` → `permissions.id` ON DELETE CASCADE

---

### 3. **`salons`** - Salões de Beleza

Cada salão é uma entidade independente.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `name` | VARCHAR(100) | NOT NULL | Nome do salão |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | URL amigável |
| `description` | TEXT | NULLABLE | Descrição do salão |
| `address` | TEXT | NULLABLE | Endereço completo |
| `phone` | VARCHAR(20) | NULLABLE | Telefone do salão |
| `email` | VARCHAR(255) | NULLABLE | Email do salão |
| `businessHours` | JSON | NULLABLE | Horários de funcionamento |
| `isActive` | BOOLEAN | DEFAULT true | Status ativo/inativo |
| `createdAt` | TIMESTAMP | NOT NULL | Data de criação |
| `updatedAt` | TIMESTAMP | NOT NULL | Data de atualização |

**Exemplo de `businessHours`:**
```json
{
  "monday": { "open": "09:00", "close": "18:00" },
  "tuesday": { "open": "09:00", "close": "18:00" },
  "wednesday": { "open": "09:00", "close": "18:00" },
  "thursday": { "open": "09:00", "close": "18:00" },
  "friday": { "open": "09:00", "close": "20:00" },
  "saturday": { "open": "09:00", "close": "17:00" },
  "sunday": { "closed": true }
}
```

---

### 4. **`user_salon_roles`** - Relacionamento User-Salon-Role

Tabela pivot que conecta usuários a salões com papéis específicos.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `userId` | UUID | FOREIGN KEY, NOT NULL | Referência ao usuário |
| `salonId` | UUID | FOREIGN KEY, NOT NULL | Referência ao salão |
| `roleId` | UUID | FOREIGN KEY, NOT NULL | Referência ao papel |
| `isActive` | BOOLEAN | DEFAULT true | Status ativo/inativo |
| `createdAt` | TIMESTAMP | NOT NULL | Data de vinculação |

**Constraints:**
- `UNIQUE(userId, salonId, roleId)` - Um usuário não pode ter o mesmo papel duplicado no mesmo salão
- `FK_user_salon_roles_userId` → `users.id` ON DELETE CASCADE
- `FK_user_salon_roles_salonId` → `salons.id` ON DELETE CASCADE
- `FK_user_salon_roles_roleId` → `roles.id` ON DELETE RESTRICT

**Exemplos:**
- João é `owner` do Salão A
- Maria é `admin` do Salão A e `worker` do Salão B
- Pedro é `client` nos Salões A, B e C

---

### 5. **`services`** - Serviços Oferecidos

Serviços que cada salão oferece.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `salonId` | UUID | FOREIGN KEY, NOT NULL | Salão que oferece |
| `name` | VARCHAR(100) | NOT NULL | Nome do serviço |
| `description` | TEXT | NULLABLE | Descrição detalhada |
| `price` | DECIMAL(10,2) | NOT NULL | Preço do serviço |
| `durationMinutes` | INTEGER | NOT NULL | Duração em minutos |
| `isActive` | BOOLEAN | DEFAULT true | Serviço disponível? |
| `createdAt` | TIMESTAMP | NOT NULL | Data de criação |
| `updatedAt` | TIMESTAMP | NOT NULL | Data de atualização |

**Exemplos:**
- Corte de Cabelo - R$ 50,00 - 30min
- Escova - R$ 40,00 - 45min
- Manicure - R$ 35,00 - 40min

---

### 6. **`products`** - Produtos Vendidos

Produtos que cada salão vende ou utiliza.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `salonId` | UUID | FOREIGN KEY, NOT NULL | Salão que vende |
| `name` | VARCHAR(100) | NOT NULL | Nome do produto |
| `description` | TEXT | NULLABLE | Descrição do produto |
| `brand` | VARCHAR(50) | NULLABLE | Marca do produto |
| `price` | DECIMAL(10,2) | NOT NULL | Preço unitário |
| `stockQuantity` | INTEGER | DEFAULT 0 | Quantidade em estoque |
| `isActive` | BOOLEAN | DEFAULT true | Produto disponível? |
| `createdAt` | TIMESTAMP | NOT NULL | Data de criação |
| `updatedAt` | TIMESTAMP | NOT NULL | Data de atualização |

---

### 7. **`appointments`** - Agendamentos

Histórico de agendamentos de serviços.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `salonId` | UUID | FOREIGN KEY, NOT NULL | Salão do agendamento |
| `clientId` | UUID | FOREIGN KEY, NOT NULL | Cliente que agendou |
| `workerId` | UUID | FOREIGN KEY, NULLABLE | Profissional designado |
| `scheduledAt` | DATETIME | NOT NULL | Data/hora do agendamento |
| `totalDurationMinutes` | INTEGER | NOT NULL | Duração total |
| `totalPrice` | DECIMAL(10,2) | NOT NULL | Preço total |
| `status` | ENUM | NOT NULL | scheduled, confirmed, in_progress, completed, cancelled |
| `notes` | TEXT | NULLABLE | Observações |
| `createdAt` | TIMESTAMP | NOT NULL | Data de criação |
| `updatedAt` | TIMESTAMP | NOT NULL | Data de atualização |

---

### 8. **`appointment_services`** - Serviços do Agendamento

Relaciona quais serviços foram incluídos em cada agendamento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `appointmentId` | UUID | FOREIGN KEY, NOT NULL | Agendamento |
| `serviceId` | UUID | FOREIGN KEY, NOT NULL | Serviço aplicado |
| `price` | DECIMAL(10,2) | NOT NULL | Preço no momento |
| `durationMinutes` | INTEGER | NOT NULL | Duração no momento |

**Nota:** Armazena preço/duração para histórico (caso o serviço mude no futuro).

---

### 9. **`appointment_products`** - Produtos do Agendamento

Produtos utilizados ou vendidos durante o agendamento.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `appointmentId` | UUID | FOREIGN KEY, NOT NULL | Agendamento |
| `productId` | UUID | FOREIGN KEY, NOT NULL | Produto usado |
| `quantity` | INTEGER | NOT NULL | Quantidade |
| `unitPrice` | DECIMAL(10,2) | NOT NULL | Preço unitário no momento |
| `totalPrice` | DECIMAL(10,2) | NOT NULL | Preço total (quantity * unitPrice) |

---

### 10. **`messages`** - Histórico de Mensagens

Todas as mensagens enviadas pelo sistema.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `salonId` | UUID | FOREIGN KEY, NOT NULL | Salão que enviou |
| `recipientId` | UUID | FOREIGN KEY, NOT NULL | Destinatário |
| `type` | ENUM | NOT NULL | whatsapp, email, sms, messenger |
| `subject` | VARCHAR(255) | NULLABLE | Assunto (email) |
| `content` | TEXT | NOT NULL | Conteúdo da mensagem |
| `status` | ENUM | DEFAULT 'pending' | pending, sent, delivered, failed |
| `metadata` | JSON | NULLABLE | Dados extras (templateId, providerId) |
| `scheduledFor` | DATETIME | NULLABLE | Agendamento de envio |
| `sentAt` | DATETIME | NULLABLE | Data/hora do envio |
| `createdAt` | TIMESTAMP | NOT NULL | Data de criação |

---

### 11. **`refresh_tokens`** - Tokens de Autenticação

Mantém tokens JWT para renovação.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY | Identificador único |
| `userId` | UUID | FOREIGN KEY, NOT NULL | Usuário proprietário |
| `token` | TEXT | UNIQUE, NOT NULL | String do JWT |
| `expiresAt` | DATETIME | NOT NULL | Data de expiração |
| `isRevoked` | BOOLEAN | DEFAULT false | Token revogado? |
| `createdAt` | TIMESTAMP | NOT NULL | Data de criação |

---

## 🔗 Relacionamentos Principais

### Multi-tenancy (Salões)

```
User ←→ UserSalonRole ←→ Salon
         ↓
        Role
```

- Um usuário pode trabalhar em múltiplos salões com papéis diferentes
- Um salão pode ter múltiplos usuários com papéis diferentes

### Agendamentos

```
Appointment → Salon
Appointment → User (client)
Appointment → User (worker)
Appointment → AppointmentServices → Service
Appointment → AppointmentProducts → Product
```

### Mensagens

```
Message → Salon (origem)
Message → User (destinatário)
```

---

## 📊 Queries Úteis

### Listar todos os salões de um usuário com seus papéis

```sql
SELECT 
    s.id,
    s.name,
    r.name as role
FROM salons s
JOIN user_salon_roles usr ON usr.salonId = s.id
JOIN roles r ON r.id = usr.roleId
JOIN users u ON u.id = usr.userId
WHERE u.id = 'USER_ID_HERE' 
  AND usr.isActive = true
  AND s.isActive = true;
```

### Histórico completo de um cliente em um salão

```sql
SELECT 
    a.scheduledAt,
    a.status,
    a.totalPrice,
    GROUP_CONCAT(DISTINCT s.name) as services,
    GROUP_CONCAT(DISTINCT p.name) as products
FROM appointments a
LEFT JOIN appointment_services aps ON aps.appointmentId = a.id
LEFT JOIN services s ON s.id = aps.serviceId
LEFT JOIN appointment_products app ON app.appointmentId = a.id
LEFT JOIN products p ON p.id = app.productId
WHERE a.clientId = 'CLIENT_ID'
  AND a.salonId = 'SALON_ID'
GROUP BY a.id
ORDER BY a.scheduledAt DESC;
```

### Mensagens pendentes para envio

```sql
SELECT 
    m.*,
    s.name as salon_name,
    u.name as recipient_name,
    u.email,
    u.phone
FROM messages m
JOIN salons s ON s.id = m.salonId
JOIN users u ON u.id = m.recipientId
WHERE m.status = 'pending'
  AND (m.scheduledFor IS NULL OR m.scheduledFor <= datetime('now'))
ORDER BY m.createdAt ASC;
```

---

## 🔐 Controle de Acesso (RBAC)

### Hierarquia de Permissões

1. **super_admin** (globalRole)
   - Acesso total a todos os salões
   - Gerenciar sistema inteiro

2. **owner** (roleId no salão)
   - Acesso total ao salão específico
   - Gerenciar admins, workers, clients
   - Ver todos os relatórios

3. **admin** (roleId no salão)
   - Gerenciar agendamentos
   - Gerenciar workers
   - Ver relatórios

4. **worker** (roleId no salão)
   - Ver seus próprios agendamentos
   - Atualizar status de agendamentos
   - Registrar serviços/produtos

5. **client** (roleId no salão)
   - Criar agendamentos
   - Ver seu próprio histórico

---

## 📈 Índices Recomendados

```sql
-- Users
CREATE INDEX idx_users_global_role ON users(globalRole);
CREATE INDEX idx_users_email ON users(email);

-- User Salon Roles
CREATE INDEX idx_usr_user_salon ON user_salon_roles(userId, salonId);
CREATE INDEX idx_usr_salon_role ON user_salon_roles(salonId, roleId);
CREATE UNIQUE INDEX idx_usr_unique ON user_salon_roles(userId, salonId, roleId);

-- Appointments
CREATE INDEX idx_appointments_salon_date ON appointments(salonId, scheduledAt);
CREATE INDEX idx_appointments_client ON appointments(clientId);
CREATE INDEX idx_appointments_worker ON appointments(workerId);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Messages
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_scheduled ON messages(scheduledFor);
CREATE INDEX idx_messages_salon_recipient ON messages(salonId, recipientId);

-- Services & Products
CREATE INDEX idx_services_salon ON services(salonId);
CREATE INDEX idx_products_salon ON products(salonId);
```

---

## 🚀 Migrações Sugeridas (Ordem)

1. **Migration 1**: Atualizar tabela `users` (adicionar `phone`, `globalRole`)
2. **Migration 2**: Criar tabela `roles` com seed de papéis padrão
3. **Migration 3**: Criar tabelas `permissions` e `role_permissions` (seed de permissões canônicas)
4. **Migration 4**: Criar tabela `salons`
5. **Migration 5**: Criar tabela `user_salon_roles`
6. **Migration 6**: Criar tabelas `services` e `products`
7. **Migration 7**: Criar tabela `appointments`
8. **Migration 8**: Criar tabelas `appointment_services` e `appointment_products`
9. **Migration 9**: Criar tabela `messages`
10. **Migration 10**: Criar tabela `refresh_tokens` (separada ou incluída conforme histórico de deploy)

---

**📅 Última atualização:** 10/11/2025  
**📌 Versão:** 2.0.0  
**🗄️ Total de tabelas:** 13 tabelas
