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
  analyzeCount: number;
  improveBulletCount: number;
}> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [result] = await db
    .select({
      totalTokens: sql<number>`coalesce(sum(${aiUsage.totalTokens}), 0)::int`,
      requestCount: sql<number>`count(*)::int`,
      analyzeCount: sql<number>`count(*) filter (where ${aiUsage.requestType} = 'analyze')::int`,
      improveBulletCount: sql<number>`count(*) filter (where ${aiUsage.requestType} = 'improve_bullet')::int`,
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
    analyzeCount: result?.analyzeCount ?? 0,
    improveBulletCount: result?.improveBulletCount ?? 0,
  };
}

export async function checkRequestLimit(
  userId: string,
  plan: PlanType,
  requestType: RequestType,
): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}> {
  const { analyzeCount, improveBulletCount } = await getMonthlyUsage(userId);
  const limits = PLAN_LIMITS[plan];

  if (requestType === 'analyze') {
    const limit = limits.monthlyAnalyses;
    const remaining = Math.max(0, limit - analyzeCount);
    return { allowed: analyzeCount < limit, used: analyzeCount, limit, remaining };
  }

  // improve_bullet
  const limit = limits.monthlyBulletImprovements;
  if (limit === -1) {
    return { allowed: true, used: improveBulletCount, limit: -1, remaining: -1 };
  }
  const remaining = Math.max(0, limit - improveBulletCount);
  return { allowed: improveBulletCount < limit, used: improveBulletCount, limit, remaining };
}
