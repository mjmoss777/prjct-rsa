import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/config/auth';
import { db } from '@/config/db';
import { savedResume } from '@/config/db/schema/ats-schema';
import { ResumeForm } from '@/components/pages/builder/ResumeForm';

export const metadata = { title: 'Edit Resume' };

export default async function EditResumePage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) notFound();

  const { resumeId } = await params;
  const id = parseInt(resumeId, 10);
  if (isNaN(id)) notFound();

  const [resume] = await db
    .select()
    .from(savedResume)
    .where(and(eq(savedResume.id, id), eq(savedResume.userId, session.user.id)))
    .limit(1);

  if (!resume) notFound();

  return (
    <div className="mx-auto max-w-[1200px] px-20 py-20">
      <div className="mb-10">
        <h1 className="m-0 font-display text-[24px] leading-[30px] tracking-[-0.02em] text-fg [text-wrap:balance]">
          Edit Resume
        </h1>
        <p className="mt-3 font-body text-[15px] leading-[24px] text-muted">
          Update your resume details and re-download.
        </p>
      </div>
      <ResumeForm
        resumeId={resume.id}
        initialData={resume.resumeData}
        initialTemplate={resume.templateType}
        initialName={resume.name}
      />
    </div>
  );
}
