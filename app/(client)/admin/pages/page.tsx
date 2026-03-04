import Link from 'next/link';
import { getPages } from './actions';
import { PagesList } from '@/components/pages/admin/PagesList';

export default async function AdminPagesPage() {
  const pages = await getPages();

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[24px] leading-[30px] text-fg">
          Pages
        </h1>
        <Link
          href="/admin/pages/new"
          className="rounded-full bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent no-underline transition-opacity hover:opacity-90 [touch-action:manipulation]"
        >
          New Page
        </Link>
      </div>
      <PagesList pages={pages} />
    </div>
  );
}
