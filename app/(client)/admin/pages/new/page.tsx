import { PageEditor } from '@/components/pages/admin/PageEditor';

export default function NewPagePage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-8 font-display text-[24px] leading-[30px] text-fg">
        New Page
      </h1>
      <PageEditor />
    </div>
  );
}
