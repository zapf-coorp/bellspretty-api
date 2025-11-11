import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSalonRole } from './user-salon-role.entity';
import { RolePermission } from './role-permission.entity';
import { ServiceRole } from './service-role.entity';

/**
 * Role Entity
 * Defines the roles that users can have within a salon
 * Available roles: owner, admin, worker, client
 */
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => UserSalonRole, (userSalonRole) => userSalonRole.role)
  userSalonRoles: UserSalonRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @OneToMany(() => ServiceRole, (serviceRole) => serviceRole.role)
  serviceRoles: ServiceRole[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
