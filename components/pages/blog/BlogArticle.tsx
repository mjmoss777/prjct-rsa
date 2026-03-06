'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Link from 'next/link';
import { TableOfContents } from './TableOfContents';
import { BlogCTA } from './BlogCTA';
import { BlogPostCard } from './BlogPostCard';
import type { TemplateData } from '@/config/db/schema/blog-schema';

const categoryLabels: Record<string, string> = {
  glossary: 'Glossary',
  'resume-guide': 'Resume Guide',
  'resume-example': 'Resume Example',
  comparison: 'Comparison',
  blog: 'Blog',
};

type Post = {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  category: string;
  author: string;
  readingTime: number;
  publishedAt: Date | null;
  templateData: unknown;
};

type RelatedPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  readingTime: number;
  publishedAt: Date | null;
};

function FaqAccordion({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-10 border-t border-border pt-8">
      <h2 className="font-display text-[22px] leading-[28px] text-fg">
        Frequently Asked Questions
      </h2>
      <div className="mt-4 flex flex-col gap-1">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-border/50">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between py-4 text-left font-body text-[16px] leading-[24px] text-fg transition-colors hover:text-accent [touch-action:manipulation]"
            >
              {faq.question}
              <span className="ml-4 shrink-0 text-subtle">
                {openIndex === i ? '−' : '+'}
              </span>
            </button>
            {openIndex === i && (
              <div className="pb-4 font-body text-[15px] leading-[24px] text-muted">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogArticle({
  post,
  relatedPosts,
}: {
  post: Post;
  relatedPosts: RelatedPost[];
}) {
  const td = post.templateData as TemplateData | null;
  const faqs = td?.faqs?.filter((f) => f.question && f.answer) ?? [];

  return (
    <div className="flex gap-10">
      {/* Article content */}
      <article className="min-w-0 flex-1">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <Link
              href={`/blog?category=${post.category}`}
              className="rounded-full border border-border-soft px-2.5 py-0.5 font-body text-[12px] uppercase tracking-[0.04em] text-muted no-underline hover:text-fg"
            >
              {categoryLabels[post.category] ?? post.category}
            </Link>
            <span className="font-body text-[13px] text-subtle">
              {post.readingTime} min read
            </span>
          </div>
          <h1 className="mt-4 font-display text-[32px] leading-[38px] tracking-[-0.02em] text-fg md:text-[40px] md:leading-[46px]">
            {post.title}
          </h1>
          <div className="mt-3 flex items-center gap-2 font-body text-[14px] text-muted">
            <span>{post.author}</span>
            {post.publishedAt && (
              <>
                <span>&middot;</span>
                <time dateTime={new Date(post.publishedAt).toISOString()}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </>
            )}
          </div>
        </header>

        {/* Markdown content */}
        <div className="prose-meld">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
            {post.content ?? ''}
          </ReactMarkdown>
        </div>

        {/* FAQ section */}
        {faqs.length > 0 && <FaqAccordion faqs={faqs} />}

        {/* CTA banner */}
        <BlogCTA variant="banner" />

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-[22px] leading-[28px] text-fg">
              Related Articles
            </h2>
            <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rp) => (
                <BlogPostCard key={rp.id} post={rp} />
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Sidebar */}
      <aside className="hidden w-[240px] shrink-0 lg:block">
        <div className="sticky top-8 flex flex-col gap-6">
          <TableOfContents content={post.content ?? ''} />
          <BlogCTA />
        </div>
      </aside>
    </div>
  );
}
