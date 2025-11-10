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
import { User } from './user.entity';
import { AppointmentService } from './appointment-service.entity';
import { AppointmentProduct } from './appointment-product.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Appointment Entity
 * Represents service appointments/bookings
 */
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'salon_id' })
  salonId: string;

  @Column({ name: 'client_id' })
  clientId: string;

  @Column({ name: 'worker_id', nullable: true })
  workerId: string;

  @Column({ type: 'datetime', name: 'scheduled_at' })
  scheduledAt: Date;

  @Column({ type: 'int', name: 'total_duration_minutes' })
  totalDurationMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relationships
  @ManyToOne(() => Salon, (salon) => salon.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @ManyToOne(() => User, (user) => user.clientAppointments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => User, (user) => user.workerAppointments, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'worker_id' })
  worker: User;

  @OneToMany(
    () => AppointmentService,
    (appointmentService) => appointmentService.appointment,
  )
  appointmentServices: AppointmentService[];

  @OneToMany(
    () => AppointmentProduct,
    (appointmentProduct) => appointmentProduct.appointment,
  )
  appointmentProducts: AppointmentProduct[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
