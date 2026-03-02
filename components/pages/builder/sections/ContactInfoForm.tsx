'use client';

import type { ResumeData } from '@/config/db/schema/ats-schema';

type ContactInfo = ResumeData['contactInfo'];

type Props = {
  value: ContactInfo;
  onChange: (value: ContactInfo) => void;
};

function Field({ label, id, value, onChange, placeholder, required }: {
  label: string; id: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-body text-[13px] leading-[16px] text-muted">
        {label}{required && <span className="text-error"> *</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[var(--radius-card)] border border-border bg-transparent px-4 py-2.5 font-body text-[15px] leading-[24px] text-fg outline-none transition-colors duration-200 placeholder:text-subtle focus:border-accent"
      />
    </div>
  );
}

export function ContactInfoForm({ value, onChange }: Props) {
  function update(key: keyof ContactInfo, v: string) {
    onChange({ ...value, [key]: v });
  }

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 font-display text-[22px] leading-[28px] tracking-[-0.01em] text-fg">
        Contact Information
      </legend>
      <Field label="Full Name" id="fullName" value={value.fullName} onChange={(v) => update('fullName', v)} placeholder="John Doe" required />
      <div className="flex gap-4">
        <div className="flex-1">
          <Field label="Email" id="email" value={value.email} onChange={(v) => update('email', v)} placeholder="john@example.com" required />
        </div>
        <div className="flex-1">
          <Field label="Phone" id="phone" value={value.phone} onChange={(v) => update('phone', v)} placeholder="(555) 123-4567" required />
        </div>
      </div>
      <Field label="Location" id="location" value={value.location ?? ''} onChange={(v) => update('location', v)} placeholder="New York, NY" />
      <Field label="LinkedIn" id="linkedIn" value={value.linkedIn ?? ''} onChange={(v) => update('linkedIn', v)} placeholder="linkedin.com/in/johndoe" />
      <Field label="Website" id="website" value={value.website ?? ''} onChange={(v) => update('website', v)} placeholder="johndoe.com" />
    </fieldset>
  );
}
