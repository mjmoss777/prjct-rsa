import { notFound } from 'next/navigation';
import { getBlogPostById } from '../../actions';
import { BlogPostEditor } from '@/components/pages/admin/BlogPostEditor';

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPostById(Number(id));
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-8 font-display text-[24px] leading-[30px] text-fg">
        Edit Blog Post
      </h1>
      <BlogPostEditor post={post} />
    </div>
  );
}
