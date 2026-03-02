'use client';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ProfessionalSummaryForm({ value, onChange }: Props) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
        Professional Summary
      </legend>
      <p className="font-body text-[13px] leading-[16px] text-subtle">
        A brief 2-3 sentence overview of your qualifications and career goals.
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        placeholder="Experienced software engineer with 5+ years building scalable web applications..."
        className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-transparent p-4 font-body text-[15px] leading-[24px] text-fg outline-none transition-colors duration-200 placeholder:text-subtle focus:border-accent"
      />
    </fieldset>
  );
}
