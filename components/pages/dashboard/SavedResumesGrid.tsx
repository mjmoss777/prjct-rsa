'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

type ResumeRow = {
  id: number;
  name: string;
  templateType: string;
  lastScanScore: number | null;
  updatedAt: Date;
};

const templateLabels: Record<string, string> = {
  'reverse-chronological': 'Classic',
  hybrid: 'Hybrid',
  minimalist: 'Minimalist',
  professional: 'Professional',
  modern: 'Modern',
};

export function SavedResumesGrid({ resumes }: { resumes: ResumeRow[] }) {
  if (resumes.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface px-6 py-10 text-center">
        <p className="m-0 font-body text-[15px] leading-[24px] text-muted">
          No saved resumes yet. Create one with the Resume Builder.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {resumes.map((resume) => (
        <Link
          key={resume.id}
          href={`/builder/${resume.id}`}
          className="group flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-5 no-underline transition-colors duration-150 hover:border-border-soft"
        >
          <div className="flex items-start justify-between">
            <h3 className="m-0 font-body text-[15px] font-medium leading-[20px] text-fg group-hover:text-accent">
              {resume.name}
            </h3>
            {resume.lastScanScore !== null && (
              <span className={cn(
                'font-display text-[18px] leading-[24px]',
                resume.lastScanScore >= 80 ? 'text-accent' : resume.lastScanScore >= 60 ? 'text-muted' : 'text-error',
              )}>
                {Math.round(resume.lastScanScore)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-pill border border-border px-2.5 py-0.5 font-body text-[13px] leading-[16px] text-subtle">
              {templateLabels[resume.templateType] ?? resume.templateType}
            </span>
          </div>
          <span className="font-body text-[13px] leading-[16px] text-subtle">
            Updated {new Date(resume.updatedAt).toLocaleDateString()}
          </span>
        </Link>
      ))}
    </div>
  );
}
