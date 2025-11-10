# 📦 Entities Documentation

This directory contains all TypeORM entities for the BellsPretty API v2.0.

## 📋 Entity List (11 Entities)

### 🔐 Core Entities
- **`user.entity.ts`** - All system users
- **`role.entity.ts`** - RBAC roles (owner, admin, worker, client)
- **`refresh-token.entity.ts`** - JWT authentication tokens

### 🏢 Salon Entities  
- **`salon.entity.ts`** - Beauty salons/establishments
- **`user-salon-role.entity.ts`** - Pivot table (User ↔ Salon ↔ Role)

### 💼 Catalog Entities
- **`service.entity.ts`** - Services offered by salons
- **`product.entity.ts`** - Products sold/used by salons

### 📅 Appointment Entities
- **`appointment.entity.ts`** - Service appointments/bookings
- **`appointment-service.entity.ts`** - Services in appointments
- **`appointment-product.entity.ts`** - Products used in appointments

### 💬 Communication Entities
- **`message.entity.ts`** - Message history (WhatsApp, Email, SMS, Messenger)

---

## 🔗 Entity Relationships

```
User ──┬── RefreshToken (1:N)
       ├── UserSalonRole (1:N) ───┬── Salon (N:1)
       │                          └── Role (N:1)
       ├── Appointment as client (1:N)
       ├── Appointment as worker (1:N)
       └── Message as recipient (1:N)

Salon ──┬── UserSalonRole (1:N)
        ├── Service (1:N)
        ├── Product (1:N)
        ├── Appointment (1:N)
        └── Message (1:N)

Appointment ──┬── AppointmentService (1:N) ─── Service (N:1)
              └── AppointmentProduct (1:N) ─── Product (N:1)
```

---

## 📊 Enums

All enums are centralized in `src/common/enums/index.ts`:

- `GlobalRole` - super_admin, user
- `SalonRole` - owner, admin, worker, client
- `AppointmentStatus` - scheduled, confirmed, in_progress, completed, cancelled
- `MessageType` - whatsapp, email, sms, messenger
- `MessageStatus` - pending, sent, delivered, failed

---

## 🎯 Usage Examples

### Import entities

```typescript
import { User, Salon, Appointment } from './entities';
```

### Import specific entity

```typescript
import { User } from './entities/user.entity';
```

### Import enums

```typescript
import { AppointmentStatus, MessageType } from './common/enums';
```

---

## 🚀 TypeORM Configuration

The entities are exported as an array in `index.ts`:

```typescript
import { entities } from './entities';

// Use in TypeORM config
TypeOrmModule.forRoot({
  entities: entities,
  // ... other config
});
```

---

## 📝 Naming Conventions

### Files
- Kebab-case: `user-salon-role.entity.ts`
- Entity suffix: `.entity.ts`

### Classes
- PascalCase: `UserSalonRole`
- No "Entity" suffix in class name

### Columns
- Snake_case in database: `user_id`, `created_at`
- CamelCase in TypeScript: `userId`, `createdAt`
- Use `@Column({ name: 'user_id' })` for mapping

### Tables
- Plural form: `users`, `salons`, `appointments`
- Snake_case: `user_salon_roles`

---

## 🔍 Column Decorators Reference

### Common Decorators

```typescript
@PrimaryGeneratedColumn('uuid')
id: string;

@Column({ length: 100 })
name: string;

@Column({ nullable: true })
description: string;

@Column({ unique: true })
email: string;

@Column({ default: true })
isActive: boolean;

@Column({ type: 'decimal', precision: 10, scale: 2 })
price: number;

@Column({ type: 'json' })
metadata: object;

@Column({ type: 'datetime' })
scheduledAt: Date;

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;
```

### Relationships

```typescript
// One-to-Many
@OneToMany(() => Role, role => role.users)
roles: Role[];

// Many-to-One
@ManyToOne(() => User, user => user.roles, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'user_id' })
user: User;
```

---

## ✅ Validation

Validation is handled by DTOs (Data Transfer Objects) in their respective modules, not in entities.

---

## 📚 Related Documentation

- [DATABASE_SCHEMA_NEW.md](../DATABASE_SCHEMA_NEW.md) - Complete schema documentation
- [docs/SCHEMA_GUIDE.md](../docs/SCHEMA_GUIDE.md) - Visual schema guide
- [docs/schema_v2.sql](../docs/schema_v2.sql) - SQL DDL

---

**📅 Last updated:** 10/11/2025  
**📌 Version:** 2.0.0
