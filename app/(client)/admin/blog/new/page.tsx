import { BlogPostEditor } from '@/components/pages/admin/BlogPostEditor';

export default function NewBlogPostPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-8 font-display text-[24px] leading-[30px] text-fg">
        New Blog Post
      </h1>
      <BlogPostEditor />
    </div>
  );
}
