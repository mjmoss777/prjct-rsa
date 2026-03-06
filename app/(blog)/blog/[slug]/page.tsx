import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/config/db';
import { blogPost } from '@/config/db/schema/blog-schema';
import { eq, and, ne, desc } from 'drizzle-orm';
import { BlogArticle } from '@/components/pages/blog/BlogArticle';

async function getPublishedPost(slug: string) {
  const [result] = await db
    .select()
    .from(blogPost)
    .where(and(eq(blogPost.slug, slug), eq(blogPost.isPublished, true)))
    .limit(1);
  return result ?? null;
}

async function getRelatedPosts(category: string, excludeId: number) {
  return db
    .select()
    .from(blogPost)
    .where(
      and(
        eq(blogPost.isPublished, true),
        eq(blogPost.category, category as 'glossary' | 'resume-guide' | 'resume-example' | 'comparison' | 'blog'),
        ne(blogPost.id, excludeId),
      ),
    )
    .orderBy(desc(blogPost.publishedAt))
    .limit(3);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return {};

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://resume-ats.com';

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription ?? post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author],
      url: `${baseUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription ?? post.excerpt ?? undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const relatedPosts = await getRelatedPosts(post.category, post.id);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://resume-ats.com';

  // JSON-LD structured data
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription ?? post.excerpt,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'ResumeATS',
      url: baseUrl,
    },
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
    ...(post.featuredImage ? { image: post.featuredImage } : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${baseUrl}/blog/${post.slug}` },
    ],
  };

  const td = post.templateData as { faqs?: { question: string; answer: string }[] } | null;
  const faqJsonLd =
    td?.faqs && td.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: td.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <BlogArticle post={post} relatedPosts={relatedPosts} />
    </>
  );
}
