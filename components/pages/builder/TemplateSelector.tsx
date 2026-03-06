'use client';

import { cn } from '@/lib/utils';
import { templateList } from '@/lib/templates/configs';
import type { TemplateType } from '@/config/db/schema/ats-schema';
import type { TemplateCategory } from '@/lib/templates/types';

type Props = {
  value: TemplateType;
  onChange: (value: TemplateType) => void;
};

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  general: 'General',
  'ats-optimized': 'ATS-Optimized',
  'industry-focused': 'Industry-Focused',
};

const CATEGORY_ORDER: TemplateCategory[] = ['general', 'ats-optimized', 'industry-focused'];

export function TemplateSelector({ value, onChange }: Props) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    templates: templateList.filter((t) => t.category === cat),
  }));

  return (
    <div className="flex flex-col gap-5">
      <h3 className="font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
        Template
      </h3>
      {grouped.map((group) => (
        <div key={group.category} className="flex flex-col gap-3">
          <h4 className="font-body text-[13px] font-medium uppercase tracking-[0.05em] text-muted">
            {group.label}
          </h4>
          <div className="flex flex-wrap gap-3">
            {group.templates.map((t) => (
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
      ))}
    </div>
  );
}
