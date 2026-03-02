'use client';

import { useState, useRef } from 'react';
import type { ResumeData } from '@/config/db/schema/ats-schema';

type SkillGroup = ResumeData['skills'][number];

type Props = {
  value: SkillGroup[];
  onChange: (value: SkillGroup[]) => void;
};

function TagInput({ items, onAdd, onRemove }: { items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void }) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput('');
    }
    if (e.key === 'Backspace' && !input && items.length > 0) {
      onRemove(items.length - 1);
    }
  }

  return (
    <div
      className="flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-[var(--radius-card)] border border-border bg-transparent px-3 py-2 transition-colors focus-within:border-accent"
      onClick={() => inputRef.current?.focus()}
    >
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-pill border border-border bg-hover-tint px-2.5 py-0.5 font-body text-[13px] leading-[16px] text-fg"
        >
          {item}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(i); }}
            className="ml-0.5 text-subtle hover:text-error"
          >
            x
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={items.length === 0 ? 'Type and press Enter...' : ''}
        className="min-w-[100px] flex-1 bg-transparent font-body text-[15px] leading-[24px] text-fg outline-none placeholder:text-subtle"
      />
    </div>
  );
}

export function SkillsForm({ value, onChange }: Props) {
  function updateGroup(idx: number, group: SkillGroup) {
    const groups = [...value];
    groups[idx] = group;
    onChange(groups);
  }

  function removeGroup(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function addSkill(idx: number, skill: string) {
    const groups = [...value];
    groups[idx] = { ...groups[idx], items: [...groups[idx].items, skill] };
    onChange(groups);
  }

  function removeSkill(groupIdx: number, skillIdx: number) {
    const groups = [...value];
    groups[groupIdx] = { ...groups[groupIdx], items: groups[groupIdx].items.filter((_, i) => i !== skillIdx) };
    onChange(groups);
  }

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
        Skills
      </legend>
      <p className="font-body text-[13px] leading-[16px] text-subtle">
        Group skills by category. Type a skill and press Enter to add.
      </p>
      {value.map((group, i) => (
        <div key={i} className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-3">
            <input
              type="text"
              value={group.category}
              onChange={(e) => updateGroup(i, { ...group, category: e.target.value })}
              placeholder="Category name (e.g., Programming Languages)"
              className="flex-1 rounded-[var(--radius-card)] border border-border bg-transparent px-3 py-2 font-body text-[15px] leading-[24px] text-fg outline-none placeholder:text-subtle focus:border-accent"
            />
            {value.length > 1 && (
              <button type="button" onClick={() => removeGroup(i)} className="font-body text-[13px] text-error">Remove</button>
            )}
          </div>
          <TagInput
            items={group.items}
            onAdd={(skill) => addSkill(i, skill)}
            onRemove={(skillIdx) => removeSkill(i, skillIdx)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { category: '', items: [] }])}
        className="self-start rounded-pill border border-border px-4 py-2 font-body text-[14px] leading-[18px] font-medium text-fg transition-colors hover:border-border-soft"
      >
        + Add Skill Category
      </button>
    </fieldset>
  );
}
