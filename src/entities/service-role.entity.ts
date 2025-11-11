import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Service } from './service.entity';
import { Role } from './role.entity';

/**
 * ServiceRole Entity (Pivot Table)
 * Defines which roles (worker types) are qualified to perform each service
 * Example: 'Coloração de Cabelo' service can be performed by 'colorist' role
 */
@Entity('service_roles')
@Unique(['serviceId', 'roleId'])
export class ServiceRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'role_id' })
  roleId: string;

  // Relationships
  @ManyToOne(() => Service, (service) => service.serviceRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => Role, (role) => role.serviceRoles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
