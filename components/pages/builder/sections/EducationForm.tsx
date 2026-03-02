'use client';

import type { ResumeData } from '@/config/db/schema/ats-schema';

type EducationEntry = ResumeData['education'][number];

type Props = {
  value: EducationEntry[];
  onChange: (value: EducationEntry[]) => void;
};

const emptyEntry: EducationEntry = {
  degree: '', institution: '', location: '', graduationDate: '', gpa: '', honors: '',
};

function Field({ label, value, onChange, placeholder, className }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block font-body text-[13px] leading-[16px] text-muted">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[var(--radius-card)] border border-border bg-transparent px-3 py-2 font-body text-[15px] leading-[24px] text-fg outline-none transition-colors duration-200 placeholder:text-subtle focus:border-accent"
      />
    </div>
  );
}

export function EducationForm({ value, onChange }: Props) {
  function updateEntry(idx: number, entry: EducationEntry) {
    const entries = [...value];
    entries[idx] = entry;
    onChange(entries);
  }

  function removeEntry(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
        Education
      </legend>
      {value.map((entry, i) => (
        <div key={i} className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-body text-[13px] leading-[16px] text-subtle">Education {i + 1}</span>
            {value.length > 1 && (
              <button type="button" onClick={() => removeEntry(i)} className="font-body text-[13px] text-error">Remove</button>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Field label="Degree" value={entry.degree} onChange={(v) => updateEntry(i, { ...entry, degree: v })} placeholder="B.S. Computer Science" className="flex-1" />
              <Field label="Institution" value={entry.institution} onChange={(v) => updateEntry(i, { ...entry, institution: v })} placeholder="MIT" className="flex-1" />
            </div>
            <div className="flex gap-3">
              <Field label="Location" value={entry.location ?? ''} onChange={(v) => updateEntry(i, { ...entry, location: v })} placeholder="Cambridge, MA" className="flex-1" />
              <Field label="Graduation Date" value={entry.graduationDate} onChange={(v) => updateEntry(i, { ...entry, graduationDate: v })} placeholder="05/2020" className="flex-1" />
            </div>
            <div className="flex gap-3">
              <Field label="GPA (optional)" value={entry.gpa ?? ''} onChange={(v) => updateEntry(i, { ...entry, gpa: v })} placeholder="3.8/4.0" className="flex-1" />
              <Field label="Honors (optional)" value={entry.honors ?? ''} onChange={(v) => updateEntry(i, { ...entry, honors: v })} placeholder="Magna Cum Laude" className="flex-1" />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { ...emptyEntry }])}
        className="self-start rounded-pill border border-border px-4 py-2 font-body text-[14px] leading-[18px] font-medium text-fg transition-colors hover:border-border-soft"
      >
        + Add Education
      </button>
    </fieldset>
  );
}
