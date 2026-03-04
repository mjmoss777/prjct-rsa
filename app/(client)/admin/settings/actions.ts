'use server';

import { headers } from 'next/headers';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { siteSettings } from '@/config/db/schema/config-schema';
import { user } from '@/config/db/schema/auth-schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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

export async function getSettings() {
  await requireAdmin();
  const [settings] = await db.select().from(siteSettings).limit(1);
  return settings ?? null;
}

export async function updateSettings(data: {
  siteName: string;
  description: string;
  copyrightText: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  googleSearchConsoleId: string;
  yandexAnalyticsId: string;
  bingAnalyticsId: string;
  posthogApiKey: string;
  posthogBaseUrl: string;
}) {
  await requireAdmin();

  const coalesce = (v: string) => (v.trim() === '' ? null : v.trim());

  const values = {
    siteName: data.siteName.trim(),
    description: coalesce(data.description),
    copyrightText: coalesce(data.copyrightText),
    googleAnalyticsId: coalesce(data.googleAnalyticsId),
    googleTagManagerId: coalesce(data.googleTagManagerId),
    googleSearchConsoleId: coalesce(data.googleSearchConsoleId),
    yandexAnalyticsId: coalesce(data.yandexAnalyticsId),
    bingAnalyticsId: coalesce(data.bingAnalyticsId),
    posthogApiKey: coalesce(data.posthogApiKey),
    posthogBaseUrl: coalesce(data.posthogBaseUrl),
    updatedAt: new Date(),
  };

  // Check if a row exists
  const [existing] = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);

  if (existing) {
    const [result] = await db
      .update(siteSettings)
      .set(values)
      .where(eq(siteSettings.id, existing.id))
      .returning();
    revalidatePath('/', 'layout');
    return result;
  } else {
    const [result] = await db
      .insert(siteSettings)
      .values(values)
      .returning();
    revalidatePath('/', 'layout');
    return result;
  }
}
