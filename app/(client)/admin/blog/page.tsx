import Link from 'next/link';
import { getBlogPosts } from './actions';
import { BlogPostsList } from '@/components/pages/admin/BlogPostsList';

export default async function AdminBlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[24px] leading-[30px] text-fg">
          Blog Posts
        </h1>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent no-underline transition-opacity hover:opacity-90 [touch-action:manipulation]"
        >
          New Post
        </Link>
      </div>
      <BlogPostsList posts={posts} />
    </div>
  );
}
