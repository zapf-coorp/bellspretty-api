import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RolePermission } from './role-permission.entity';

export enum PermissionScope {
  GLOBAL = 'global',
  SALON = 'salon',
}

/**
 * Permission Entity
 * Defines granular permissions for RBAC
 * Examples: 'appointments.create', 'salons.manage', 'products.sell'
 */
@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: PermissionScope.SALON,
  })
  scope: PermissionScope;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
