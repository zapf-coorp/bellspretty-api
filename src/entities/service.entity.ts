import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Salon } from './salon.entity';
import { AppointmentService } from './appointment-service.entity';
import { ServiceRole } from './service-role.entity';

/**
 * Service Entity
 * Represents services offered by each salon
 * Examples: Haircut, Manicure, Facial, etc.
 */
@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'salon_id' })
  salonId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => Salon, (salon) => salon.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @OneToMany(
    () => AppointmentService,
    (appointmentService) => appointmentService.service,
  )
  appointmentServices: AppointmentService[];

  @OneToMany(() => ServiceRole, (serviceRole) => serviceRole.service)
  serviceRoles: ServiceRole[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
