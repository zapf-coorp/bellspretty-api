import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Salon } from './salon.entity';
import { Role } from './role.entity';

/**
 * UserSalonRole Entity (Pivot Table)
 * Connects users to salons with specific roles
 * Implements RBAC (Role-Based Access Control)
 * 
 * Example: João is 'owner' of Salon A and 'worker' of Salon B
 */
@Entity('user_salon_roles')
@Unique(['userId', 'salonId', 'roleId'])
export class UserSalonRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'salon_id' })
  salonId: string;

  @Column({ name: 'role_id' })
  roleId: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => User, (user) => user.userSalonRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Salon, (salon) => salon.userSalonRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @ManyToOne(() => Role, (role) => role.userSalonRoles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
