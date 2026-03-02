'use client';

import { cn } from '@/lib/utils';
import { templateList } from '@/lib/templates/configs';
import type { TemplateType } from '@/config/db/schema/ats-schema';

type Props = {
  value: TemplateType;
  onChange: (value: TemplateType) => void;
};

export function TemplateSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
        Template
      </h3>
      <div className="flex flex-wrap gap-3">
        {templateList.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              'flex flex-col items-start gap-1 rounded-[var(--radius-card)] border px-4 py-3 text-left transition-colors',
              value === t.id
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-border-soft',
            )}
          >
            <span className="font-body text-[15px] font-medium leading-[24px] text-fg">
              {t.name}
            </span>
            <span className="font-body text-[13px] leading-[16px] text-subtle">
              {t.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
