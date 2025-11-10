import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Salon } from './salon.entity';
import { User } from './user.entity';

export enum MessageType {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  SMS = 'sms',
  MESSENGER = 'messenger',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

/**
 * Message Entity
 * Stores all messages sent through the system
 * Supports: WhatsApp, Email, SMS, Facebook Messenger
 */
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'salon_id' })
  salonId: string;

  @Column({ name: 'recipient_id' })
  recipientId: string;

  @Column({ type: 'varchar', length: 20 })
  type: MessageType;

  @Column({ nullable: true })
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: MessageStatus.PENDING,
  })
  status: MessageStatus;

  @Column({ type: 'json', nullable: true })
  metadata: {
    templateId?: string;
    providerId?: string;
    errorMessage?: string;
    [key: string]: any;
  };

  @Column({ type: 'datetime', nullable: true, name: 'scheduled_for' })
  scheduledFor: Date;

  @Column({ type: 'datetime', nullable: true, name: 'sent_at' })
  sentAt: Date;

  // Relationships
  @ManyToOne(() => Salon, (salon) => salon.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
