import { db } from '@/config/db';
import { aiUsage, type RequestType } from '@/config/db/schema/usage-schema';
import { sql, eq, and, gte } from 'drizzle-orm';
import { PLAN_LIMITS, type PlanType } from './plans';

export async function trackUsage(params: {
  userId: string;
  requestType: RequestType;
  inputTokens: number;
  outputTokens: number;
  model: string;
}): Promise<void> {
  await db.insert(aiUsage).values({
    userId: params.userId,
    requestType: params.requestType,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    totalTokens: params.inputTokens + params.outputTokens,
    model: params.model,
  });
}

export async function getMonthlyUsage(userId: string): Promise<{
  totalTokens: number;
  requestCount: number;
}> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({
      totalTokens: sql<number>`coalesce(sum(${aiUsage.totalTokens}), 0)::int`,
      requestCount: sql<number>`count(*)::int`,
    })
    .from(aiUsage)
    .where(
      and(
        eq(aiUsage.userId, userId),
        gte(aiUsage.createdAt, startOfMonth),
      ),
    );

  return {
    totalTokens: result?.totalTokens ?? 0,
    requestCount: result?.requestCount ?? 0,
  };
}

export async function checkUsageLimit(userId: string, plan: PlanType): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const { totalTokens } = await getMonthlyUsage(userId);
  const limit = PLAN_LIMITS[plan].monthlyTokens;
  const remaining = Math.max(0, limit - totalTokens);

  return {
    allowed: totalTokens < limit,
    used: totalTokens,
    limit,
    remaining,
  };
}
