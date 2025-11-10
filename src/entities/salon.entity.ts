import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserSalonRole } from './user-salon-role.entity';
import { Service } from './service.entity';
import { Product } from './product.entity';
import { Appointment } from './appointment.entity';
import { Message } from './message.entity';

/**
 * Salon Entity
 * Represents a beauty salon/establishment
 * Multi-tenant: Each salon is independent
 */
@Entity('salons')
export class Salon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'json', nullable: true, name: 'business_hours' })
  businessHours: {
    [key: string]: {
      open?: string;
      close?: string;
      closed?: boolean;
    };
  };

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  // Relationships
  @OneToMany(() => UserSalonRole, (userSalonRole) => userSalonRole.salon)
  userSalonRoles: UserSalonRole[];

  @OneToMany(() => Service, (service) => service.salon)
  services: Service[];

  @OneToMany(() => Product, (product) => product.salon)
  products: Product[];

  @OneToMany(() => Appointment, (appointment) => appointment.salon)
  appointments: Appointment[];

  @OneToMany(() => Message, (message) => message.salon)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
