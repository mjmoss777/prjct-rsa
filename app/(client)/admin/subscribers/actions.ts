'use server';

import { headers } from 'next/headers';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { user } from '@/config/db/schema/auth-schema';
import { subscription } from '@/config/db/schema/subscription-schema';
import { eq, sql } from 'drizzle-orm';

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

export async function getSubscribers(planFilter?: string) {
  await requireAdmin();

  const query = db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      createdAt: subscription.createdAt,
    })
    .from(subscription)
    .innerJoin(user, eq(subscription.userId, user.id));

  if (planFilter && planFilter !== 'all') {
    return query.where(eq(subscription.plan, planFilter));
  }

  return query;
}

export async function getRevenueStats() {
  await requireAdmin();

  const [stats] = await db
    .select({
      totalSubscribers: sql<number>`count(*)::int`,
      activeProCount: sql<number>`count(*) filter (where ${subscription.plan} = 'pro' and ${subscription.status} = 'active')::int`,
    })
    .from(subscription);

  return {
    totalSubscribers: stats?.totalSubscribers ?? 0,
    activeProCount: stats?.activeProCount ?? 0,
  };
}
