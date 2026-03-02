'use client';

import type { ResumeData, TemplateType } from '@/config/db/schema/ats-schema';
import { getTemplate } from '@/lib/templates/configs';
import { ResumePreviewHTML } from '@/lib/templates/preview-renderer';

type Props = {
  data: ResumeData;
  templateType: TemplateType;
};

export function ResumePreview({ data, templateType }: Props) {
  const style = getTemplate(templateType);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
        Preview
      </h3>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
        <div
          className="origin-top-left"
          style={{ transform: 'scale(0.65)', transformOrigin: 'top left', width: '153.85%' }}
        >
          <ResumePreviewHTML data={data} style={style} />
        </div>
      </div>
    </div>
  );
}
