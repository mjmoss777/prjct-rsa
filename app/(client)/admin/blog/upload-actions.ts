'use server';

import crypto from 'crypto';
import { headers } from 'next/headers';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { user } from '@/config/db/schema/auth-schema';
import { eq } from 'drizzle-orm';

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Not authenticated');

  const [dbUser] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!dbUser || dbUser.role !== 'admin') throw new Error('Not authorized');
  return session.user;
}

export async function getUploadSignature() {
  await requireAdmin();

  const secretKey = process.env.UC_SECRET_KEY;
  if (!secretKey) throw new Error('UC_SECRET_KEY is not configured');

  const expire = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(String(expire))
    .digest('hex');

  return { signature, expire };
}
