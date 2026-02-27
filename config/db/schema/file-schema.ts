import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const uploadedFile = pgTable('uploaded_file', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  blobUrl: text('blob_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
