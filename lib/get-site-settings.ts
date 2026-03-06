import { cache } from 'react';
import { db } from '@/config/db';
import { siteSettings } from '@/config/db/schema/config-schema';
import { safeDecrypt } from '@/lib/crypto';

export const getSiteSettings = cache(async () => {
  const [settings] = await db.select().from(siteSettings).limit(1);
  if (!settings) return null;

  return {
    ...settings,
    posthogApiKey: safeDecrypt(settings.posthogApiKey),
  };
});
