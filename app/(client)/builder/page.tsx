import type { Metadata } from 'next';
import { ResumeForm } from '@/components/pages/builder/ResumeForm';

export const metadata: Metadata = {
  title: 'Resume Builder',
  description:
    'Build an ATS-optimized resume with professional templates. Download as DOCX or PDF.',
  openGraph: {
    title: 'Resume Builder',
    description: 'Build ATS-optimized resumes with professional templates.',
  },
  robots: { index: false },
};

export default function BuilderPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-20 py-20">
      <div className="mb-10">
        <h1 className="m-0 font-display text-[24px] leading-[30px] tracking-[-0.02em] text-fg [text-wrap:balance]">
          Resume Builder
        </h1>
        <p className="mt-3 font-body text-[15px] leading-[24px] text-muted">
          Build an ATS-optimized resume. Choose a template, fill in your details, and download as DOCX or PDF.
        </p>
      </div>
      <ResumeForm />
    </div>
  );
}
