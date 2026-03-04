import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export type RequestType = 'analyze' | 'improve_bullet';

export const aiUsage = pgTable('ai_usage', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  requestType: text('request_type').notNull(), // 'analyze' | 'improve_bullet'
  inputTokens: integer('input_tokens').notNull(),
  outputTokens: integer('output_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  model: text('model').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
