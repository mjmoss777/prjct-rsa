import { db } from '@/config/db';
import { user } from '@/config/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import type { PlanType } from './plans';

const PLAN_RANK: Record<PlanType, number> = { free: 0, pro: 1 };

export async function requirePlan(
  minimumPlan: PlanType,
  userId: string,
): Promise<void> {
  const [dbUser] = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const userPlan = (dbUser?.plan as PlanType) || 'free';

  if (PLAN_RANK[userPlan] < PLAN_RANK[minimumPlan]) {
    throw new Error(`This feature requires the ${minimumPlan} plan`);
  }
}
