import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/config/db';
import { page } from '@/config/db/schema/config-schema';
import { eq, and } from 'drizzle-orm';
import { PageContent } from '@/components/pages/public/PageContent';

async function getPublishedPage(slug: string) {
  const [result] = await db
    .select()
    .from(page)
    .where(and(eq(page.slug, slug), eq(page.isPublished, true)))
    .limit(1);
  return result ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublishedPage(slug);
  if (!p) return {};

  return {
    title: p.title,
    description: p.metaDescription ?? undefined,
  };
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPublishedPage(slug);
  if (!p) notFound();

  return <PageContent title={p.title} content={p.content ?? ''} updatedAt={p.updatedAt} />;
}
