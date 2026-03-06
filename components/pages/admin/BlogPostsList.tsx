'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteBlogPost } from '@/app/(client)/admin/blog/actions';

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  category: string;
  isPublished: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
};

const categoryLabels: Record<string, string> = {
  glossary: 'Glossary',
  'resume-guide': 'Guide',
  'resume-example': 'Example',
  comparison: 'Comparison',
  blog: 'Blog',
};

export function BlogPostsList({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [confirmId, setConfirmId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    await deleteBlogPost(id);
    setConfirmId(null);
    router.refresh();
  }

  return (
    <div className="mt-8 flex flex-col">
      {/* Header row */}
      <div className="flex items-center border-b border-border px-2 pb-3">
        <span className="flex-1 font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Title
        </span>
        <span className="w-[100px] font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Category
        </span>
        <span className="w-[90px] text-center font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Status
        </span>
        <span className="w-[120px] text-center font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Published
        </span>
        <span className="w-[140px] text-right font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Actions
        </span>
      </div>

      {posts.length === 0 && (
        <p className="py-8 text-center font-body text-[15px] text-muted">
          No blog posts yet. Create one to get started.
        </p>
      )}

      {posts.map((p) => (
        <div
          key={p.id}
          className="flex items-center border-b border-border/50 px-2 py-3"
        >
          {/* Title */}
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="font-body text-[15px] leading-[20px] text-fg">
              {p.title}
            </span>
            <span className="font-body text-[13px] text-muted">
              /blog/{p.slug}
            </span>
          </div>

          {/* Category */}
          <div className="w-[100px]">
            <span className="inline-block rounded-full border border-border-soft px-2.5 py-0.5 font-body text-[12px] uppercase tracking-[0.04em] text-muted">
              {categoryLabels[p.category] ?? p.category}
            </span>
          </div>

          {/* Status */}
          <div className="flex w-[90px] items-center justify-center">
            <span className="flex items-center gap-1.5 font-body text-[13px] text-muted">
              <span
                className={`inline-block h-[6px] w-[6px] rounded-full ${
                  p.isPublished ? 'bg-accent-soft' : 'bg-subtle'
                }`}
              />
              {p.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>

          {/* Published date */}
          <div className="w-[120px] text-center font-body text-[13px] text-muted">
            {p.publishedAt
              ? new Date(p.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </div>

          {/* Actions */}
          <div className="flex w-[140px] items-center justify-end gap-2">
            <Link
              href={`/admin/blog/${p.id}/edit`}
              className="rounded-full border border-border-soft bg-transparent px-4 py-1.5 font-body text-[14px] font-medium leading-[18px] text-fg no-underline transition-colors hover:bg-hover-tint [touch-action:manipulation]"
            >
              Edit
            </Link>
            {confirmId === p.id ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="rounded-full bg-error px-4 py-1.5 font-body text-[14px] font-medium leading-[18px] text-on-accent transition-opacity hover:opacity-90 [touch-action:manipulation]"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(null)}
                  className="rounded-full border border-border-soft bg-transparent px-4 py-1.5 font-body text-[14px] font-medium leading-[18px] text-fg transition-colors hover:bg-hover-tint [touch-action:manipulation]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmId(p.id)}
                className="rounded-full border border-error-soft bg-transparent px-4 py-1.5 font-body text-[14px] font-medium leading-[18px] text-error transition-colors hover:bg-error/5 [touch-action:manipulation]"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
