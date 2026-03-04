import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export type AuthEventType =
  | 'sign_in'
  | 'sign_in_failed'
  | 'sign_up'
  | 'otp_sent'
  | 'otp_verified'
  | 'password_reset'
  | 'lockout';

export const authEvent = pgTable('auth_event', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  eventType: text('event_type').notNull().$type<AuthEventType>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
