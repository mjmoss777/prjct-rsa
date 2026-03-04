'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createPage, updatePage } from '@/app/(client)/admin/pages/actions';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type PageData = {
  id?: number;
  slug: string;
  title: string;
  content: string | null;
  metaDescription: string | null;
  isPublished: boolean;
};

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function PageEditor({ page }: { page?: PageData }) {
  const router = useRouter();
  const isEdit = !!page?.id;

  const [title, setTitle] = useState(page?.title ?? '');
  const [slug, setSlug] = useState(page?.slug ?? '');
  const [content, setContent] = useState(page?.content ?? '');
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription ?? '');
  const [isPublished, setIsPublished] = useState(page?.isPublished ?? true);
  const [slugManual, setSlugManual] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (!slugManual) setSlug(toSlug(val));
    },
    [slugManual],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { slug, title, content, metaDescription, isPublished };
      if (isEdit && page?.id) {
        await updatePage(page.id, data);
      } else {
        await createPage(data);
      }
      router.push('/admin/pages');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full border border-border rounded-[8px] bg-surface text-fg font-body text-[15px] leading-[24px] px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Title */}
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Title
        </span>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={inputClass}
          placeholder="Page title"
        />
      </label>

      {/* Slug */}
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Slug
        </span>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => {
            setSlugManual(true);
            setSlug(e.target.value);
          }}
          className={inputClass}
          placeholder="page-slug"
        />
        <span className="font-body text-[13px] text-subtle">
          URL: /{slug || '…'}
        </span>
      </label>

      {/* Meta Description */}
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Meta Description
        </span>
        <textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          rows={2}
          className={inputClass + ' resize-none'}
          placeholder="SEO description (optional)"
        />
      </label>

      {/* Published toggle */}
      <label className="flex items-center gap-3 [touch-action:manipulation]">
        <button
          type="button"
          role="switch"
          aria-checked={isPublished}
          onClick={() => setIsPublished(!isPublished)}
          className={`relative h-[24px] w-[44px] shrink-0 rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
            isPublished ? 'bg-accent' : 'bg-border'
          }`}
        >
          <span
            className={`absolute top-[2px] left-[2px] h-[20px] w-[20px] rounded-full bg-surface transition-transform duration-150 ${
              isPublished ? 'translate-x-[20px]' : ''
            }`}
          />
        </button>
        <span className="font-body text-[15px] text-fg">
          {isPublished ? 'Published' : 'Draft'}
        </span>
      </label>

      {/* Markdown Editor */}
      <div className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Content
        </span>
        <div data-color-mode="light">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? '')}
            height={400}
            preview="live"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent transition-opacity hover:opacity-90 disabled:opacity-60 [touch-action:manipulation]"
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Page'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/pages')}
          className="rounded-full border border-border-soft bg-transparent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-fg transition-colors hover:bg-hover-tint [touch-action:manipulation]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
