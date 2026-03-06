'use server';

import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { user } from '@/config/db/schema/auth-schema';
import { subscription } from '@/config/db/schema/subscription-schema';
import { getMonthlyUsage } from '@/lib/usage';
import { PLAN_LIMITS, type PlanType } from '@/lib/plans';
import { createCheckoutUrl, getCustomerPortalUrl } from '@/lib/polar';

export async function getBillingInfo() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  const [dbUser] = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const plan = (dbUser?.plan as PlanType) || 'free';
  const limits = PLAN_LIMITS[plan];

  const [sub] = await db
    .select()
    .from(subscription)
    .where(eq(subscription.userId, session.user.id))
    .limit(1);

  const { analyzeCount, improveBulletCount } = await getMonthlyUsage(session.user.id);

  return {
    plan,
    planLabel: limits.label,
    price: limits.price,
    features: limits.features,
    subscription: sub
      ? {
          status: sub.status,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        }
      : null,
    usage: {
      analyses: { used: analyzeCount, limit: limits.monthlyAnalyses },
      bulletImprovements: { used: improveBulletCount, limit: limits.monthlyBulletImprovements },
      analyzePercentage: Math.min(100, Math.round((analyzeCount / limits.monthlyAnalyses) * 100)),
    },
  };
}

export async function createCheckoutSession(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  const productId = process.env.POLAR_PRO_PRODUCT_ID;
  if (!productId) throw new Error('Payment not configured');

  return createCheckoutUrl(session.user.id, productId);
}

export async function getPortalUrl(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');

  const [sub] = await db
    .select({ polarCustomerId: subscription.polarCustomerId })
    .from(subscription)
    .where(eq(subscription.userId, session.user.id))
    .limit(1);

  if (!sub?.polarCustomerId) throw new Error('No subscription found');

  return getCustomerPortalUrl(sub.polarCustomerId);
}
