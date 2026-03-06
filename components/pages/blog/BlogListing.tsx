import Link from 'next/link';
import { BlogPostCard } from './BlogPostCard';

const categoryFilters = [
  { label: 'All', value: null },
  { label: 'Glossary', value: 'glossary' },
  { label: 'Resume Guides', value: 'resume-guide' },
  { label: 'Examples', value: 'resume-example' },
  { label: 'Comparisons', value: 'comparison' },
];

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  readingTime: number;
  publishedAt: Date | null;
};

export function BlogListing({
  posts,
  currentCategory,
  currentPage,
  totalPages,
}: {
  posts: Post[];
  currentCategory: string | null;
  currentPage: number;
  totalPages: number;
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-[32px] leading-[38px] tracking-[-0.02em] text-fg">
          Blog
        </h1>
        <p className="mt-2 font-body text-[15px] text-muted">
          Tips, guides, and resources to beat the ATS and land your dream job.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {categoryFilters.map((filter) => {
          const isActive = currentCategory === filter.value;
          const href = filter.value
            ? `/blog?category=${filter.value}`
            : '/blog';
          return (
            <Link
              key={filter.label}
              href={href}
              className={`rounded-full px-4 py-2 font-body text-[14px] no-underline transition-colors ${
                isActive
                  ? 'bg-accent text-on-accent'
                  : 'border border-border bg-surface text-muted hover:bg-hover-tint hover:text-fg'
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <p className="py-12 text-center font-body text-[15px] text-muted">
          No posts found.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-4">
          {currentPage > 1 && (
            <Link
              href={`/blog?${currentCategory ? `category=${currentCategory}&` : ''}page=${currentPage - 1}`}
              className="rounded-full border border-border px-4 py-2 font-body text-[14px] text-muted no-underline transition-colors hover:bg-hover-tint hover:text-fg"
            >
              Previous
            </Link>
          )}
          <span className="font-body text-[14px] text-subtle">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/blog?${currentCategory ? `category=${currentCategory}&` : ''}page=${currentPage + 1}`}
              className="rounded-full border border-border px-4 py-2 font-body text-[14px] text-muted no-underline transition-colors hover:bg-hover-tint hover:text-fg"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
