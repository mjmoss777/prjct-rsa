'use server';

import { headers } from 'next/headers';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { blogPost } from '@/config/db/schema/blog-schema';
import { user } from '@/config/db/schema/auth-schema';
import { eq, desc } from 'drizzle-orm';
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

function computeReadingTime(content: string | null | undefined): number {
  if (!content) return 1;
  return Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));
}

export async function getBlogPosts() {
  await requireAdmin();
  return db
    .select()
    .from(blogPost)
    .orderBy(desc(blogPost.updatedAt));
}

export async function getBlogPostById(id: number) {
  await requireAdmin();
  const [result] = await db.select().from(blogPost).where(eq(blogPost.id, id)).limit(1);
  return result ?? null;
}

export async function createBlogPost(data: {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  featuredImage: string;
  metaDescription: string;
  metaTitle: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string;
  templateData: Record<string, unknown>;
}) {
  await requireAdmin();
  const [result] = await db
    .insert(blogPost)
    .values({
      slug: data.slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || null,
      category: data.category as 'glossary' | 'resume-guide' | 'resume-example' | 'comparison' | 'blog',
      author: data.author || 'ResumeATS Team',
      featuredImage: data.featuredImage || null,
      readingTime: computeReadingTime(data.content),
      metaDescription: data.metaDescription || null,
      metaTitle: data.metaTitle || null,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      templateData: data.templateData ?? {},
    })
    .returning();
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath('/sitemap.xml');
  return result;
}

export async function updateBlogPost(
  id: number,
  data: {
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    author: string;
    featuredImage: string;
    metaDescription: string;
    metaTitle: string;
    isPublished: boolean;
    isFeatured: boolean;
    publishedAt: string;
    templateData: Record<string, unknown>;
  },
) {
  await requireAdmin();

  const [existing] = await db
    .select({ slug: blogPost.slug })
    .from(blogPost)
    .where(eq(blogPost.id, id))
    .limit(1);

  const [result] = await db
    .update(blogPost)
    .set({
      slug: data.slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt || null,
      category: data.category as 'glossary' | 'resume-guide' | 'resume-example' | 'comparison' | 'blog',
      author: data.author || 'ResumeATS Team',
      featuredImage: data.featuredImage || null,
      readingTime: computeReadingTime(data.content),
      metaDescription: data.metaDescription || null,
      metaTitle: data.metaTitle || null,
      isPublished: data.isPublished,
      isFeatured: data.isFeatured,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      templateData: data.templateData ?? {},
      updatedAt: new Date(),
    })
    .where(eq(blogPost.id, id))
    .returning();

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  if (existing && existing.slug !== data.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }
  revalidatePath('/sitemap.xml');
  return result;
}

export async function deleteBlogPost(id: number) {
  await requireAdmin();
  const [existing] = await db
    .select({ slug: blogPost.slug })
    .from(blogPost)
    .where(eq(blogPost.id, id))
    .limit(1);
  await db.delete(blogPost).where(eq(blogPost.id, id));
  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  if (existing) revalidatePath(`/blog/${existing.slug}`);
  revalidatePath('/sitemap.xml');
}
