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
import { AppointmentProduct } from './appointment-product.entity';

/**
 * Product Entity
 * Represents products sold or used by each salon
 * Examples: Shampoo, Conditioner, Hair dye, etc.
 */
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'salon_id' })
  salonId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  brand: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0, name: 'stock_quantity' })
  stockQuantity: number;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  // Relationships
  @ManyToOne(() => Salon, (salon) => salon.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salon_id' })
  salon: Salon;

  @OneToMany(
    () => AppointmentProduct,
    (appointmentProduct) => appointmentProduct.product,
  )
  appointmentProducts: AppointmentProduct[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
