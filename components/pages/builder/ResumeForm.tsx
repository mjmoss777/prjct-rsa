'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import type { ResumeData, TemplateType } from '@/config/db/schema/ats-schema';
import { saveResume } from '@/app/(client)/builder/actions';
import { TemplateSelector } from './TemplateSelector';
import { ResumePreview } from './ResumePreview';
import { ContactInfoForm } from './sections/ContactInfoForm';
import { ProfessionalSummaryForm } from './sections/ProfessionalSummaryForm';
import { WorkExperienceForm } from './sections/WorkExperienceForm';
import { EducationForm } from './sections/EducationForm';
import { SkillsForm } from './sections/SkillsForm';
import { CertificationsForm } from './sections/CertificationsForm';

const emptyData: ResumeData = {
  contactInfo: { fullName: '', email: '', phone: '' },
  professionalSummary: '',
  workExperience: [{ jobTitle: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] }],
  education: [{ degree: '', institution: '', location: '', graduationDate: '' }],
  skills: [{ category: '', items: [] }],
  certifications: [],
};

type Props = {
  initialData?: ResumeData;
  initialTemplate?: TemplateType;
  initialName?: string;
  resumeId?: number;
};

export function ResumeForm({ initialData, initialTemplate, initialName, resumeId }: Props) {
  const [data, setData] = useState<ResumeData>(initialData ?? emptyData);
  const [templateType, setTemplateType] = useState<TemplateType>(initialTemplate ?? 'reverse-chronological');
  const [name, setName] = useState(initialName ?? '');
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!name.trim()) {
      setError('Please enter a name for your resume.');
      return;
    }
    setError(null);
    setSaved(false);

    startTransition(async () => {
      try {
        await saveResume({
          id: resumeId,
          name: name.trim(),
          templateType,
          resumeData: data,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save.');
      }
    });
  }

  return (
    <div className="flex gap-8">
      {/* Left: Form */}
      <div className="flex min-w-0 flex-1 flex-col gap-10">
        {/* Resume name */}
        <div>
          <label htmlFor="resumeName" className="mb-2 block font-body text-[13px] leading-[16px] text-muted">
            Resume Name
          </label>
          <input
            id="resumeName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Resume"
            className="w-full rounded-[var(--radius-card)] border border-border bg-transparent px-4 py-2.5 font-body text-[15px] leading-[24px] text-fg outline-none placeholder:text-subtle focus:border-accent"
          />
        </div>

        <TemplateSelector value={templateType} onChange={setTemplateType} />
        <ContactInfoForm value={data.contactInfo} onChange={(v) => setData({ ...data, contactInfo: v })} />
        <ProfessionalSummaryForm value={data.professionalSummary} onChange={(v) => setData({ ...data, professionalSummary: v })} />
        <WorkExperienceForm value={data.workExperience} onChange={(v) => setData({ ...data, workExperience: v })} />
        <EducationForm value={data.education} onChange={(v) => setData({ ...data, education: v })} />
        <SkillsForm value={data.skills} onChange={(v) => setData({ ...data, skills: v })} />
        <CertificationsForm value={data.certifications ?? []} onChange={(v) => setData({ ...data, certifications: v })} />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {error && (
            <p className="m-0 font-body text-[15px] leading-[24px] text-error">{error}</p>
          )}
          {saved && (
            <p className="m-0 font-body text-[15px] leading-[24px] text-accent">Saved successfully.</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className={cn(
                'rounded-pill bg-accent px-8 py-3 font-body text-[16px] font-medium leading-[20px] text-on-accent transition-opacity',
                isPending ? 'pointer-events-none opacity-40' : 'hover:opacity-90',
              )}
            >
              {isPending ? 'Saving...' : 'Save Resume'}
            </button>
            {resumeId && (
              <>
                <a
                  href={`/api/download/docx?id=${resumeId}`}
                  className="inline-flex items-center rounded-pill border border-border px-6 py-3 font-body text-[16px] font-medium leading-[20px] text-fg transition-colors hover:border-border-soft"
                >
                  Download DOCX
                </a>
                <a
                  href={`/api/download/pdf?id=${resumeId}`}
                  className="inline-flex items-center rounded-pill border border-border px-6 py-3 font-body text-[16px] font-medium leading-[20px] text-fg transition-colors hover:border-border-soft"
                >
                  Download PDF
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="sticky top-8 hidden w-[480px] shrink-0 self-start xl:block">
        <ResumePreview data={data} templateType={templateType} />
      </div>
    </div>
  );
}
