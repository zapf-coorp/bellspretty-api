/**
 * Entities Index
 * Central export point for all TypeORM entities
 */

// Core Entities
import { User } from './user.entity';
import { Role } from './role.entity';
import { RefreshToken } from './refresh-token.entity';

// Salon Entities
import { Salon } from './salon.entity';
import { UserSalonRole } from './user-salon-role.entity';

// Catalog Entities
import { Service } from './service.entity';
import { Product } from './product.entity';

// Appointment Entities
import { Appointment, AppointmentStatus } from './appointment.entity';
import { AppointmentService } from './appointment-service.entity';
import { AppointmentProduct } from './appointment-product.entity';

// Communication Entities
import { Message, MessageType, MessageStatus } from './message.entity';

// Re-export all entities
export {
  User,
  Role,
  RefreshToken,
  Salon,
  UserSalonRole,
  Service,
  Product,
  Appointment,
  AppointmentStatus,
  AppointmentService,
  AppointmentProduct,
  Message,
  MessageType,
  MessageStatus,
};

// Entity array for TypeORM config
export const entities = [
  User,
  Role,
  RefreshToken,
  Salon,
  UserSalonRole,
  Service,
  Product,
  Appointment,
  AppointmentService,
  AppointmentProduct,
  Message,
];
