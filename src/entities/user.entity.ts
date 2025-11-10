import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import { UserSalonRole } from './user-salon-role.entity';
import { Appointment } from './appointment.entity';
import { Message } from './message.entity';

/**
 * User Entity
 * Represents all users in the system (owners, admins, workers, clients)
 * Access control is managed through globalRole and user_salon_roles
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'user',
    name: 'global_role',
  })
  globalRole: 'super_admin' | 'user';

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  // Relationships
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => UserSalonRole, (userSalonRole) => userSalonRole.user)
  userSalonRoles: UserSalonRole[];

  @OneToMany(() => Appointment, (appointment) => appointment.client)
  clientAppointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.worker)
  workerAppointments: Appointment[];

  @OneToMany(() => Message, (message) => message.recipient)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}