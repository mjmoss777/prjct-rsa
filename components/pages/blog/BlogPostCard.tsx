import Link from 'next/link';

const categoryLabels: Record<string, string> = {
  glossary: 'Glossary',
  'resume-guide': 'Guide',
  'resume-example': 'Example',
  comparison: 'Comparison',
  blog: 'Blog',
};

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  readingTime: number;
  publishedAt: Date | null;
};

export function BlogPostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-3 rounded-[16px] border border-border bg-surface p-6 no-underline transition-colors hover:border-border-soft"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-border-soft px-2.5 py-0.5 font-body text-[12px] uppercase tracking-[0.04em] text-muted">
          {categoryLabels[post.category] ?? post.category}
        </span>
        <span className="font-body text-[13px] text-subtle">
          {post.readingTime} min read
        </span>
      </div>
      <h3 className="font-display text-[20px] leading-[26px] text-fg group-hover:text-accent">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="line-clamp-2 font-body text-[15px] leading-[22px] text-muted">
          {post.excerpt}
        </p>
      )}
      {post.publishedAt && (
        <span className="mt-auto font-body text-[13px] text-subtle">
          {new Date(post.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      )}
    </Link>
  );
}
