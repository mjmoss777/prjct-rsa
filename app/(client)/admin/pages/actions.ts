'use server';

import { headers } from 'next/headers';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { page } from '@/config/db/schema/config-schema';
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

export async function getPages() {
  await requireAdmin();
  return db
    .select()
    .from(page)
    .orderBy(page.updatedAt);
}

export async function getPageById(id: number) {
  await requireAdmin();
  const [result] = await db.select().from(page).where(eq(page.id, id)).limit(1);
  return result ?? null;
}

export async function createPage(data: {
  slug: string;
  title: string;
  content: string;
  metaDescription: string;
  isPublished: boolean;
}) {
  await requireAdmin();
  const [result] = await db
    .insert(page)
    .values({
      slug: data.slug,
      title: data.title,
      content: data.content,
      metaDescription: data.metaDescription,
      isPublished: data.isPublished,
    })
    .returning();
  revalidatePath('/admin/pages');
  revalidatePath(`/${data.slug}`);
  revalidatePath('/sitemap.xml');
  return result;
}

export async function updatePage(
  id: number,
  data: {
    slug: string;
    title: string;
    content: string;
    metaDescription: string;
    isPublished: boolean;
  },
) {
  await requireAdmin();

  // Get old slug to revalidate
  const [existing] = await db.select({ slug: page.slug }).from(page).where(eq(page.id, id)).limit(1);

  const [result] = await db
    .update(page)
    .set({
      slug: data.slug,
      title: data.title,
      content: data.content,
      metaDescription: data.metaDescription,
      isPublished: data.isPublished,
      updatedAt: new Date(),
    })
    .where(eq(page.id, id))
    .returning();

  revalidatePath('/admin/pages');
  revalidatePath(`/${data.slug}`);
  if (existing && existing.slug !== data.slug) {
    revalidatePath(`/${existing.slug}`);
  }
  revalidatePath('/sitemap.xml');
  return result;
}

export async function deletePage(id: number) {
  await requireAdmin();
  const [existing] = await db.select({ slug: page.slug }).from(page).where(eq(page.id, id)).limit(1);
  await db.delete(page).where(eq(page.id, id));
  revalidatePath('/admin/pages');
  if (existing) revalidatePath(`/${existing.slug}`);
  revalidatePath('/sitemap.xml');
}
