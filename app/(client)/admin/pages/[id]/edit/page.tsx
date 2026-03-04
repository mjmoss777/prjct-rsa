import { notFound } from 'next/navigation';
import { getPageById } from '../../actions';
import { PageEditor } from '@/components/pages/admin/PageEditor';

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await getPageById(Number(id));
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-8 font-display text-[24px] leading-[30px] text-fg">
        Edit Page
      </h1>
      <PageEditor page={page} />
    </div>
  );
}
