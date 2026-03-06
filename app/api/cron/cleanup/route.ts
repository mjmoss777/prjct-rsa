import { sql } from 'drizzle-orm';
import { db } from '@/config/db';

export const dynamic = 'force-dynamic';

/**
 * Prune expired sessions and verification tokens.
 * Call via cron (e.g. Vercel Cron, external scheduler) with the CRON_SECRET header.
 *
 * Example cron config (vercel.json):
 *   { "crons": [{ "path": "/api/cron/cleanup", "schedule": "0 3 * * *" }] }
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessions = await db.execute(
    sql`DELETE FROM session WHERE expires_at < NOW()`,
  );
  const verifications = await db.execute(
    sql`DELETE FROM verification WHERE expires_at < NOW()`,
  );

  return Response.json({
    pruned: {
      sessions: sessions.rowCount ?? 0,
      verifications: verifications.rowCount ?? 0,
    },
  });
}
