'use server';

import { headers } from 'next/headers';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { user } from '@/config/db/schema/auth-schema';
import { aiUsage } from '@/config/db/schema/usage-schema';
import { sql, eq, gte, desc } from 'drizzle-orm';

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

export async function getUsageStats() {
  await requireAdmin();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totals] = await db
    .select({
      totalTokens: sql<number>`coalesce(sum(${aiUsage.totalTokens}), 0)::int`,
      totalRequests: sql<number>`count(*)::int`,
      analyzeCount: sql<number>`count(*) filter (where ${aiUsage.requestType} = 'analyze')::int`,
      improveBulletCount: sql<number>`count(*) filter (where ${aiUsage.requestType} = 'improve_bullet')::int`,
    })
    .from(aiUsage)
    .where(gte(aiUsage.createdAt, startOfMonth));

  // Cost estimate: ~$0.01 per 1k tokens (configurable)
  const costPerToken = 0.00001;
  const estimatedCost = (totals?.totalTokens ?? 0) * costPerToken;

  return {
    totalTokens: totals?.totalTokens ?? 0,
    totalRequests: totals?.totalRequests ?? 0,
    analyzeCount: totals?.analyzeCount ?? 0,
    improveBulletCount: totals?.improveBulletCount ?? 0,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
  };
}

export async function getTopUsers(limit = 10) {
  await requireAdmin();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const results = await db
    .select({
      userId: aiUsage.userId,
      userName: user.name,
      userEmail: user.email,
      totalTokens: sql<number>`sum(${aiUsage.totalTokens})::int`,
      requestCount: sql<number>`count(*)::int`,
    })
    .from(aiUsage)
    .innerJoin(user, eq(aiUsage.userId, user.id))
    .where(gte(aiUsage.createdAt, startOfMonth))
    .groupBy(aiUsage.userId, user.name, user.email)
    .orderBy(desc(sql`sum(${aiUsage.totalTokens})`))
    .limit(limit);

  return results;
}
