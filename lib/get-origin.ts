import { unstable_cache } from 'next/cache';
import { db } from '@/config/db';
import { originDomain } from '@/config/db/schema/config-schema';
import { eq } from 'drizzle-orm';

const FALLBACK = process.env.NEXT_PUBLIC_APP_URL ?? 'https://resume-ats.com';

const getDefaultDomain = unstable_cache(
  async () => {
    try {
      const row = await db
        .select({ domain: originDomain.domain })
        .from(originDomain)
        .where(eq(originDomain.isDefault, true))
        .limit(1);

      return row[0]?.domain ? `https://${row[0].domain}` : FALLBACK;
    } catch {
      return FALLBACK;
    }
  },
  ['origin-domain'],
  { revalidate: 3600 },
);

export async function getOrigin(): Promise<string> {
  return getDefaultDomain();
}
