/**
 * Global Enums
 * Centralized enums used across the application
 */

/**
 * Global roles for system-wide access control
 */
export enum GlobalRole {
  SUPER_ADMIN = 'super_admin',
  USER = 'user',
}

/**
 * Salon-specific roles (RBAC)
 */
export enum SalonRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  WORKER = 'worker',
  CLIENT = 'client',
}

/**
 * Appointment statuses
 */
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Message types/channels
 */
export enum MessageType {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  SMS = 'sms',
  MESSENGER = 'messenger',
}

/**
 * Message delivery statuses
 */
export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}
