import { cache } from 'react';
import { db } from '@/config/db';
import { siteSettings } from '@/config/db/schema/config-schema';

export const getSiteSettings = cache(async () => {
  const [settings] = await db.select().from(siteSettings).limit(1);
  return settings ?? null;
});
