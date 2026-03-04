'use server';

import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { user } from '@/config/db/schema/auth-schema';
import { getMonthlyUsage } from '@/lib/usage';
import { PLAN_LIMITS, type PlanType } from '@/lib/plans';

export async function getUserUsage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  const [dbUser] = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const plan = (dbUser?.plan as PlanType) || 'free';
  const { totalTokens } = await getMonthlyUsage(session.user.id);
  const limit = PLAN_LIMITS[plan].monthlyTokens;
  const remaining = Math.max(0, limit - totalTokens);
  const percentage = Math.min(100, Math.round((totalTokens / limit) * 100));

  return { plan, used: totalTokens, limit, remaining, percentage };
}
