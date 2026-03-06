import type { MetadataRoute } from 'next';
import { db } from '@/config/db';
import { page } from '@/config/db/schema/config-schema';
import { blogPost } from '@/config/db/schema/blog-schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://resume-ats.com';

  const [publishedPages, publishedPosts] = await Promise.all([
    db
      .select({ slug: page.slug, updatedAt: page.updatedAt })
      .from(page)
      .where(eq(page.isPublished, true)),
    db
      .select({ slug: blogPost.slug, updatedAt: blogPost.updatedAt })
      .from(blogPost)
      .where(eq(blogPost.isPublished, true)),
  ]);

  const pageEntries: MetadataRoute.Sitemap = publishedPages.map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = publishedPosts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...pageEntries,
    ...blogEntries,
  ];
}
