import { sql } from 'drizzle-orm';
import { db } from '@/config/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json({ status: 'ok', db: 'connected' });
  } catch {
    return Response.json({ status: 'error', db: 'unreachable' }, { status: 503 });
  }
}
