'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { analyzeResume } from '@/app/(client)/checker/actions';

export function CheckerForm() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(file: File | null) {
    if (!file) return;
    const valid = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!valid.includes(file.type)) {
      setError('Only PDF and DOCX files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB.');
      return;
    }
    setError(null);
    setFileName(file.name);
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await analyzeResume(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-8">
      {/* File upload */}
      <div>
        <label className="mb-3 block font-body text-[15px] leading-[18px] text-fg">
          Resume File
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file && fileRef.current) {
              const dt = new DataTransfer();
              dt.items.add(file);
              fileRef.current.files = dt.files;
              handleFileChange(file);
            }
          }}
          className={cn(
            'w-full cursor-pointer rounded-[var(--radius-card)] border-2 border-dashed px-6 py-10 text-center transition-colors duration-200 [touch-action:manipulation]',
            dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-border-soft',
          )}
        >
          {fileName ? (
            <p className="m-0 font-body text-[15px] font-medium leading-[24px] text-fg">
              {fileName}
            </p>
          ) : (
            <>
              <p className="m-0 font-body text-[15px] leading-[24px] text-muted">
                Drag & drop your resume here, or click to browse
              </p>
              <p className="mt-1 font-body text-[13px] leading-[16px] text-subtle">
                PDF or DOCX, up to 5MB
              </p>
            </>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          name="resume"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Job description */}
      <div>
        <label
          htmlFor="jobDescription"
          className="mb-3 block font-body text-[15px] leading-[18px] text-fg"
        >
          Job Description
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          required
          rows={8}
          placeholder="Paste the full job description here…"
          className="w-full resize-y rounded-[var(--radius-card)] border border-border bg-transparent p-4 font-body text-[15px] leading-[24px] text-fg outline-none transition-colors duration-200 placeholder:text-subtle focus:border-accent"
        />
      </div>

      {/* Error message */}
      {error && (
        <p role="alert" aria-live="polite" className="m-0 font-body text-[15px] leading-[24px] text-error">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!fileName || pending}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-pill bg-accent px-8 py-3.5 font-body text-[16px] font-medium leading-[20px] text-on-accent transition-opacity duration-200 [touch-action:manipulation]',
          !fileName || pending
            ? 'pointer-events-none opacity-40'
            : 'cursor-pointer hover:opacity-90 active:opacity-85',
        )}
      >
        {pending && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        )}
        {pending ? 'Analyzing\u2026' : 'Analyze Resume'}
      </button>
    </form>
  );
}
