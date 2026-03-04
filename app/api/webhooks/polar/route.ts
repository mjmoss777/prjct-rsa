import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import { db } from '@/config/db';
import { user } from '@/config/db/schema/auth-schema';
import { subscription } from '@/config/db/schema/subscription-schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const body = await req.text();
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 });
  }

  let event: ReturnType<typeof validateEvent>;
  try {
    event = validateEvent(body, Object.fromEntries(req.headers), webhookSecret);
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      return new Response('Invalid signature', { status: 403 });
    }
    return new Response('Webhook error', { status: 400 });
  }

  const type = event.type;

  if (
    type === 'subscription.created' ||
    type === 'subscription.updated' ||
    type === 'subscription.active' ||
    type === 'subscription.uncanceled'
  ) {
    const sub = event.data;
    const metadata = sub.metadata as Record<string, string> | undefined;
    const userId = metadata?.userId;
    if (!userId) return new Response('OK', { status: 200 });

    const plan = sub.productId === process.env.POLAR_PRO_PRODUCT_ID ? 'pro' : 'free';

    await db
      .insert(subscription)
      .values({
        userId,
        polarSubscriptionId: sub.id,
        polarCustomerId: sub.customerId,
        plan,
        status: sub.status,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: subscription.userId,
        set: {
          polarSubscriptionId: sub.id,
          polarCustomerId: sub.customerId,
          plan,
          status: sub.status,
          currentPeriodStart: sub.currentPeriodStart,
          currentPeriodEnd: sub.currentPeriodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          updatedAt: new Date(),
        },
      });

    // Sync user.plan convenience column
    await db
      .update(user)
      .set({ plan, updatedAt: new Date() })
      .where(eq(user.id, userId));
  }

  if (type === 'subscription.revoked' || type === 'subscription.canceled') {
    const sub = event.data;
    const metadata = sub.metadata as Record<string, string> | undefined;
    const userId = metadata?.userId;
    if (!userId) return new Response('OK', { status: 200 });

    if (type === 'subscription.revoked') {
      await db
        .update(subscription)
        .set({ status: 'canceled', plan: 'free', updatedAt: new Date() })
        .where(eq(subscription.userId, userId));

      await db
        .update(user)
        .set({ plan: 'free', updatedAt: new Date() })
        .where(eq(user.id, userId));
    } else {
      // canceled — still active until period end
      await db
        .update(subscription)
        .set({
          status: sub.status,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscription.userId, userId));
    }
  }

  return new Response('OK', { status: 200 });
}
