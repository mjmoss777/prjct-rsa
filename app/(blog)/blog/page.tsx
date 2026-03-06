import type { Metadata } from 'next';
import { db } from '@/config/db';
import { blogPost } from '@/config/db/schema/blog-schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { BlogListing } from '@/components/pages/blog/BlogListing';
import type { BlogCategory } from '@/config/db/schema/blog-schema';

const POSTS_PER_PAGE = 12;

const categoryTitles: Record<string, string> = {
  glossary: 'Glossary',
  'resume-guide': 'Resume Guides',
  'resume-example': 'Resume Examples',
  comparison: 'Comparisons',
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}): Promise<Metadata> {
  const { category } = await searchParams;
  const catTitle = category ? categoryTitles[category] : null;

  return {
    title: catTitle ? `${catTitle} - Blog` : 'Blog',
    description: catTitle
      ? `Browse our ${catTitle.toLowerCase()} to improve your resume and land more interviews.`
      : 'Tips, guides, and resources to help you beat the ATS and land your dream job.',
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  const conditions = [eq(blogPost.isPublished, true)];
  if (category && Object.keys(categoryTitles).includes(category)) {
    conditions.push(eq(blogPost.category, category as BlogCategory));
  }

  const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);

  const [posts, countResult] = await Promise.all([
    db
      .select()
      .from(blogPost)
      .where(whereClause)
      .orderBy(desc(blogPost.isFeatured), desc(blogPost.publishedAt))
      .limit(POSTS_PER_PAGE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPost)
      .where(whereClause),
  ]);

  const totalPosts = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <BlogListing
      posts={posts}
      currentCategory={category ?? null}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
