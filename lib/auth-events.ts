import { db } from '@/config/db';
import { authEvent, type AuthEventType } from '@/config/db/schema/auth-event-schema';

export async function logAuthEvent(params: {
  userId?: string | null;
  eventType: AuthEventType;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(authEvent).values({
    userId: params.userId ?? null,
    eventType: params.eventType,
    ipAddress: params.ipAddress ?? null,
    userAgent: params.userAgent ?? null,
    metadata: params.metadata ?? null,
  });
}
