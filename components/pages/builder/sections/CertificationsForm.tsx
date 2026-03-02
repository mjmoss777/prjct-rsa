'use client';

import type { ResumeData } from '@/config/db/schema/ats-schema';

type Certification = NonNullable<ResumeData['certifications']>[number];

type Props = {
  value: Certification[];
  onChange: (value: Certification[]) => void;
};

const emptyEntry: Certification = { name: '', issuer: '', date: '' };

export function CertificationsForm({ value, onChange }: Props) {
  function updateEntry(idx: number, entry: Certification) {
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
        Certifications
      </legend>
      {value.map((entry, i) => (
        <div key={i} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block font-body text-[13px] leading-[16px] text-muted">Name</label>
            <input
              type="text"
              value={entry.name}
              onChange={(e) => updateEntry(i, { ...entry, name: e.target.value })}
              placeholder="AWS Solutions Architect"
              className="w-full rounded-[var(--radius-card)] border border-border bg-transparent px-3 py-2 font-body text-[15px] leading-[24px] text-fg outline-none placeholder:text-subtle focus:border-accent"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block font-body text-[13px] leading-[16px] text-muted">Issuer</label>
            <input
              type="text"
              value={entry.issuer}
              onChange={(e) => updateEntry(i, { ...entry, issuer: e.target.value })}
              placeholder="Amazon Web Services"
              className="w-full rounded-[var(--radius-card)] border border-border bg-transparent px-3 py-2 font-body text-[15px] leading-[24px] text-fg outline-none placeholder:text-subtle focus:border-accent"
            />
          </div>
          <div className="w-[120px]">
            <label className="mb-1.5 block font-body text-[13px] leading-[16px] text-muted">Date</label>
            <input
              type="text"
              value={entry.date ?? ''}
              onChange={(e) => updateEntry(i, { ...entry, date: e.target.value })}
              placeholder="2023"
              className="w-full rounded-[var(--radius-card)] border border-border bg-transparent px-3 py-2 font-body text-[15px] leading-[24px] text-fg outline-none placeholder:text-subtle focus:border-accent"
            />
          </div>
          <button type="button" onClick={() => removeEntry(i)} className="pb-2 font-body text-[13px] text-error">
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { ...emptyEntry }])}
        className="self-start rounded-pill border border-border px-4 py-2 font-body text-[14px] leading-[18px] font-medium text-fg transition-colors hover:border-border-soft"
      >
        + Add Certification
      </button>
    </fieldset>
  );
}
