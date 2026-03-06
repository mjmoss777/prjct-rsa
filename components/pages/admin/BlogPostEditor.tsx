'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createBlogPost, updateBlogPost } from '@/app/(client)/admin/blog/actions';
import { getUploadSignature } from '@/app/(client)/admin/blog/upload-actions';
import { uploadToUploadcare } from '@/lib/uploadcare';
import type { BlogCategory, TemplateData } from '@/config/db/schema/blog-schema';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type BlogPostData = {
  id?: number;
  slug: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  category: string;
  author: string;
  featuredImage: string | null;
  metaDescription: string | null;
  metaTitle: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: Date | null;
  templateData: TemplateData | null;
};

const categories: { value: BlogCategory; label: string }[] = [
  { value: 'blog', label: 'Blog' },
  { value: 'glossary', label: 'Glossary' },
  { value: 'resume-guide', label: 'Resume Guide' },
  { value: 'resume-example', label: 'Resume Example' },
  { value: 'comparison', label: 'Comparison' },
];

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toDateInputValue(d: Date | null): string {
  if (!d) return '';
  const date = new Date(d);
  return date.toISOString().slice(0, 16);
}

export function BlogPostEditor({ post }: { post?: BlogPostData }) {
  const router = useRouter();
  const isEdit = !!post?.id;

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [content, setContent] = useState(post?.content ?? '');
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '');
  const [category, setCategory] = useState<BlogCategory>((post?.category as BlogCategory) ?? 'blog');
  const [author, setAuthor] = useState(post?.author ?? 'ResumeATS Team');
  const [featuredImage, setFeaturedImage] = useState(post?.featuredImage ?? '');
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? '');
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? '');
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false);
  const [isFeatured, setIsFeatured] = useState(post?.isFeatured ?? false);
  const [publishedAt, setPublishedAt] = useState(toDateInputValue(post?.publishedAt ?? null));
  const [slugManual, setSlugManual] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const editorFileInputRef = useRef<HTMLInputElement>(null);
  const featuredFileInputRef = useRef<HTMLInputElement>(null);

  // Template data
  const td = post?.templateData ?? {};
  const [term, setTerm] = useState(td.term ?? '');
  const [targetRole, setTargetRole] = useState(td.targetRole ?? '');
  const [comparisonA, setComparisonA] = useState(td.comparisonA ?? '');
  const [comparisonB, setComparisonB] = useState(td.comparisonB ?? '');
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(td.faqs ?? []);

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (!slugManual) setSlug(toSlug(val));
    },
    [slugManual],
  );

  function buildTemplateData(): TemplateData {
    const data: TemplateData = {};
    if (category === 'glossary' && term) data.term = term;
    if ((category === 'resume-guide' || category === 'resume-example') && targetRole)
      data.targetRole = targetRole;
    if (category === 'comparison') {
      if (comparisonA) data.comparisonA = comparisonA;
      if (comparisonB) data.comparisonB = comparisonB;
    }
    if (faqs.length > 0) data.faqs = faqs.filter((f) => f.question && f.answer);
    return data;
  }

  async function handleImageUpload(file: File, insertInEditor = true): Promise<string | null> {
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB');
      return null;
    }
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return null;
    }

    const placeholder = `![Uploading ${file.name}...](uploading-${Date.now()})`;

    if (insertInEditor) {
      const textarea = document.querySelector(
        '.w-md-editor-text-input',
      ) as HTMLTextAreaElement | null;
      const pos = textarea?.selectionStart ?? content.length;
      setContent((prev) => {
        const before = prev.slice(0, pos);
        const after = prev.slice(pos);
        const sep = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
        return before + sep + placeholder + '\n' + after;
      });
    }

    try {
      const { signature, expire } = await getUploadSignature();
      const url = await uploadToUploadcare(file, signature, expire);
      if (insertInEditor) {
        setContent((prev) => prev.replace(placeholder, `![${file.name}](${url})`));
      }
      return url;
    } catch (err) {
      if (insertInEditor) {
        setContent((prev) => prev.replace(placeholder + '\n', '').replace(placeholder, ''));
      }
      alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      return null;
    }
  }

  const imageUploadCommand = {
    name: 'image',
    keyCommand: 'image',
    icon: (
      <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
        <path d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z" />
      </svg>
    ),
    execute: () => {
      editorFileInputRef.current?.click();
    },
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        slug,
        title,
        content,
        excerpt,
        category,
        author,
        featuredImage,
        metaDescription,
        metaTitle,
        isPublished,
        isFeatured,
        publishedAt,
        templateData: buildTemplateData(),
      };
      if (isEdit && post?.id) {
        await updateBlogPost(post.id, data);
      } else {
        await createBlogPost(data);
      }
      router.push('/admin/blog');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full border border-border rounded-[8px] bg-surface text-fg font-body text-[15px] leading-[24px] px-3 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Hidden file inputs for image uploads */}
      <input
        ref={editorFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await handleImageUpload(file);
          e.target.value = '';
        }}
      />
      <input
        ref={featuredFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploadingFeatured(true);
          const url = await handleImageUpload(file, false);
          if (url) setFeaturedImage(url);
          setUploadingFeatured(false);
          e.target.value = '';
        }}
      />

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
          placeholder="Blog post title"
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
          placeholder="post-slug"
        />
        <span className="font-body text-[13px] text-subtle">
          URL: /blog/{slug || '...'}
        </span>
      </label>

      {/* Category + Author row */}
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as BlogCategory)}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
            Author
          </span>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={inputClass}
            placeholder="ResumeATS Team"
          />
        </label>
      </div>

      {/* Excerpt */}
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Excerpt
        </span>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className={inputClass + ' resize-none'}
          placeholder="Short summary for listing cards"
        />
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
          placeholder="SEO description"
        />
      </label>

      {/* Meta Title */}
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Meta Title Override
        </span>
        <input
          type="text"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          className={inputClass}
          placeholder="Override page title for SEO (optional)"
        />
      </label>

      {/* Featured Image */}
      <div className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Featured Image
        </span>
        {featuredImage ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredImage}
              alt="Featured"
              className="h-20 w-32 rounded-[8px] border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => setFeaturedImage('')}
              className="rounded-full border border-error-soft bg-transparent px-3 py-1.5 font-body text-[13px] text-error transition-colors hover:bg-error/5 [touch-action:manipulation]"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploadingFeatured}
            onClick={() => featuredFileInputRef.current?.click()}
            className="w-fit rounded-full border border-border-soft bg-transparent px-4 py-2 font-body text-[14px] font-medium text-fg transition-colors hover:bg-hover-tint disabled:opacity-60 [touch-action:manipulation]"
          >
            {uploadingFeatured ? 'Uploading...' : 'Upload Image'}
          </button>
        )}
      </div>

      {/* Published At */}
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Published Date
        </span>
        <input
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          className={inputClass}
        />
      </label>

      {/* Toggles row */}
      <div className="flex items-center gap-8">
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

        {/* Featured toggle */}
        <label className="flex items-center gap-3 [touch-action:manipulation]">
          <button
            type="button"
            role="switch"
            aria-checked={isFeatured}
            onClick={() => setIsFeatured(!isFeatured)}
            className={`relative h-[24px] w-[44px] shrink-0 rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
              isFeatured ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span
              className={`absolute top-[2px] left-[2px] h-[20px] w-[20px] rounded-full bg-surface transition-transform duration-150 ${
                isFeatured ? 'translate-x-[20px]' : ''
              }`}
            />
          </button>
          <span className="font-body text-[15px] text-fg">
            {isFeatured ? 'Featured' : 'Not Featured'}
          </span>
        </label>
      </div>

      {/* Template Data — conditional fields */}
      <div className="border-t border-border pt-6">
        <span className="font-body text-[13px] font-medium uppercase tracking-[0.04em] text-subtle">
          Template Data
        </span>

        <div className="mt-4 flex flex-col gap-4">
          {category === 'glossary' && (
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
                Term
              </span>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className={inputClass}
                placeholder="e.g. Applicant Tracking System"
              />
            </label>
          )}

          {(category === 'resume-guide' || category === 'resume-example') && (
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
                Target Role
              </span>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className={inputClass}
                placeholder="e.g. Software Engineer"
              />
            </label>
          )}

          {category === 'comparison' && (
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
                  Compare A
                </span>
                <input
                  type="text"
                  value={comparisonA}
                  onChange={(e) => setComparisonA(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Resume"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
                  Compare B
                </span>
                <input
                  type="text"
                  value={comparisonB}
                  onChange={(e) => setComparisonB(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. CV"
                />
              </label>
            </div>
          )}

          {/* FAQs */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
                FAQs
              </span>
              <button
                type="button"
                onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
                className="rounded-full border border-border-soft bg-transparent px-4 py-1.5 font-body text-[14px] font-medium leading-[18px] text-fg transition-colors hover:bg-hover-tint [touch-action:manipulation]"
              >
                Add FAQ
              </button>
            </div>
            {faqs.map((faq, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-[8px] border border-border/50 p-3">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[i] = { ...updated[i], question: e.target.value };
                    setFaqs(updated);
                  }}
                  className={inputClass}
                  placeholder="Question"
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[i] = { ...updated[i], answer: e.target.value };
                    setFaqs(updated);
                  }}
                  rows={2}
                  className={inputClass + ' resize-none'}
                  placeholder="Answer"
                />
                <button
                  type="button"
                  onClick={() => setFaqs(faqs.filter((_, j) => j !== i))}
                  className="self-end rounded-full border border-error-soft bg-transparent px-3 py-1 font-body text-[13px] text-error transition-colors hover:bg-error/5 [touch-action:manipulation]"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Markdown Editor */}
      <div className="flex flex-col gap-1.5">
        <span className="font-body text-[13px] uppercase tracking-[0.04em] text-subtle">
          Content
        </span>
        <div
          data-color-mode="light"
          onDrop={(e) => {
            const files = e.dataTransfer?.files;
            if (!files?.length) return;
            for (const file of Array.from(files)) {
              if (file.type.startsWith('image/')) {
                e.preventDefault();
                handleImageUpload(file);
                return;
              }
            }
          }}
          onDragOver={(e) => {
            if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
          }}
        >
          <MDEditor
            value={content}
            onChange={(val) => setContent(val ?? '')}
            height={500}
            preview="live"
            commandsFilter={(cmd) => {
              if (cmd.name === 'image') return imageUploadCommand;
              return cmd;
            }}
            textareaProps={{
              onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
                const items = e.clipboardData?.items;
                if (!items) return;
                for (const item of Array.from(items)) {
                  if (item.type.startsWith('image/')) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) handleImageUpload(file);
                    return;
                  }
                }
              },
            }}
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
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="rounded-full border border-border-soft bg-transparent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-fg transition-colors hover:bg-hover-tint [touch-action:manipulation]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
