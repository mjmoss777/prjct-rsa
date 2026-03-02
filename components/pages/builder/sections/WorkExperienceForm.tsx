'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ResumeData } from '@/config/db/schema/ats-schema';
import { improveBulletPoint } from '@/app/(client)/builder/actions';

type WorkEntry = ResumeData['workExperience'][number];

type Props = {
  value: WorkEntry[];
  onChange: (value: WorkEntry[]) => void;
};

const emptyEntry: WorkEntry = {
  jobTitle: '', company: '', location: '', startDate: '', endDate: '', bullets: [''],
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

function EntryCard({ entry, index, total, onUpdate, onRemove, onMove }: {
  entry: WorkEntry;
  index: number;
  total: number;
  onUpdate: (entry: WorkEntry) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [improvingIdx, setImprovingIdx] = useState<number | null>(null);

  function updateField<K extends keyof WorkEntry>(key: K, val: WorkEntry[K]) {
    onUpdate({ ...entry, [key]: val });
  }

  function updateBullet(bulletIdx: number, text: string) {
    const bullets = [...entry.bullets];
    bullets[bulletIdx] = text;
    onUpdate({ ...entry, bullets });
  }

  function addBullet() {
    onUpdate({ ...entry, bullets: [...entry.bullets, ''] });
  }

  function removeBullet(bulletIdx: number) {
    const bullets = entry.bullets.filter((_, i) => i !== bulletIdx);
    onUpdate({ ...entry, bullets: bullets.length === 0 ? [''] : bullets });
  }

  async function handleImprove(bulletIdx: number) {
    const text = entry.bullets[bulletIdx];
    if (!text.trim() || !entry.jobTitle.trim()) return;
    setImprovingIdx(bulletIdx);
    try {
      const improved = await improveBulletPoint(text, entry.jobTitle, entry.company);
      updateBullet(bulletIdx, improved);
    } catch {
      // Silently fail — user can retry
    } finally {
      setImprovingIdx(null);
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-body text-[13px] leading-[16px] text-subtle">Position {index + 1}</span>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button type="button" onClick={() => onMove(-1)} className="font-body text-[13px] text-accent">Up</button>
          )}
          {index < total - 1 && (
            <button type="button" onClick={() => onMove(1)} className="font-body text-[13px] text-accent">Down</button>
          )}
          {total > 1 && (
            <button type="button" onClick={onRemove} className="font-body text-[13px] text-error">Remove</button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Field label="Job Title" value={entry.jobTitle} onChange={(v) => updateField('jobTitle', v)} placeholder="Software Engineer" className="flex-1" />
          <Field label="Company" value={entry.company} onChange={(v) => updateField('company', v)} placeholder="ACME Corp" className="flex-1" />
        </div>
        <div className="flex gap-3">
          <Field label="Location" value={entry.location ?? ''} onChange={(v) => updateField('location', v)} placeholder="San Francisco, CA" className="flex-1" />
          <Field label="Start Date" value={entry.startDate} onChange={(v) => updateField('startDate', v)} placeholder="01/2020" className="flex-1" />
          <Field label="End Date" value={entry.endDate} onChange={(v) => updateField('endDate', v)} placeholder="Present" className="flex-1" />
        </div>

        <div>
          <label className="mb-1.5 block font-body text-[13px] leading-[16px] text-muted">Bullet Points</label>
          <div className="flex flex-col gap-2">
            {entry.bullets.map((bullet, bulletIdx) => (
              <div key={bulletIdx} className="flex items-start gap-2">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => updateBullet(bulletIdx, e.target.value)}
                  placeholder="Describe your achievement or responsibility..."
                  className="flex-1 rounded-[var(--radius-card)] border border-border bg-transparent px-3 py-2 font-body text-[15px] leading-[24px] text-fg outline-none transition-colors duration-200 placeholder:text-subtle focus:border-accent"
                />
                <button
                  type="button"
                  disabled={improvingIdx === bulletIdx}
                  onClick={() => handleImprove(bulletIdx)}
                  className={cn(
                    'shrink-0 rounded-pill border border-accent px-3 py-2 font-body text-[13px] leading-[16px] text-accent transition-opacity',
                    improvingIdx === bulletIdx ? 'opacity-40' : 'hover:opacity-80',
                  )}
                >
                  {improvingIdx === bulletIdx ? 'Improving...' : 'AI Improve'}
                </button>
                {entry.bullets.length > 1 && (
                  <button type="button" onClick={() => removeBullet(bulletIdx)} className="shrink-0 px-2 py-2 font-body text-[13px] text-error">
                    x
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addBullet}
            className="mt-2 font-body text-[13px] leading-[16px] text-accent"
          >
            + Add bullet point
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkExperienceForm({ value, onChange }: Props) {
  function updateEntry(idx: number, entry: WorkEntry) {
    const entries = [...value];
    entries[idx] = entry;
    onChange(entries);
  }

  function removeEntry(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function moveEntry(idx: number, dir: -1 | 1) {
    const entries = [...value];
    const target = idx + dir;
    [entries[idx], entries[target]] = [entries[target], entries[idx]];
    onChange(entries);
  }

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
        Work Experience
      </legend>
      {value.map((entry, i) => (
        <EntryCard
          key={i}
          entry={entry}
          index={i}
          total={value.length}
          onUpdate={(e) => updateEntry(i, e)}
          onRemove={() => removeEntry(i)}
          onMove={(dir) => moveEntry(i, dir)}
        />
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { ...emptyEntry }])}
        className="self-start rounded-pill border border-border px-4 py-2 font-body text-[14px] leading-[18px] font-medium text-fg transition-colors hover:border-border-soft"
      >
        + Add Position
      </button>
    </fieldset>
  );
}
