import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const subscription = pgTable('subscription', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  polarSubscriptionId: text('polar_subscription_id').unique(),
  polarCustomerId: text('polar_customer_id'),
  plan: text('plan').notNull().default('free'), // 'free' | 'pro'
  status: text('status').notNull().default('active'), // 'active' | 'canceled' | 'past_due' | 'incomplete'
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
