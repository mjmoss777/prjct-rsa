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
  const limits = PLAN_LIMITS[plan];
  const { analyzeCount, improveBulletCount } = await getMonthlyUsage(session.user.id);

  const analyzePercentage = Math.min(100, Math.round((analyzeCount / limits.monthlyAnalyses) * 100));

  return {
    plan,
    analyses: { used: analyzeCount, limit: limits.monthlyAnalyses },
    bulletImprovements: { used: improveBulletCount, limit: limits.monthlyBulletImprovements },
    analyzePercentage,
  };
}
