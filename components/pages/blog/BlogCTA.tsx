import Link from 'next/link';

export function BlogCTA({ variant = 'card' }: { variant?: 'card' | 'banner' }) {
  if (variant === 'banner') {
    return (
      <div className="mt-12 rounded-[16px] border border-border bg-hover-tint p-8 text-center">
        <h3 className="font-display text-[22px] leading-[28px] text-fg">
          Ready to optimize your resume?
        </h3>
        <p className="mx-auto mt-2 max-w-md font-body text-[15px] text-muted">
          Upload your resume and get an instant ATS compatibility score with actionable feedback.
        </p>
        <Link
          href="/sign-up"
          className="mt-4 inline-block rounded-full bg-accent px-8 py-3.5 font-body text-[16px] font-medium text-on-accent no-underline transition-opacity hover:opacity-90"
        >
          Check your ATS score for free
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-border p-5">
      <h4 className="font-display text-[18px] leading-[24px] text-fg">
        Check your ATS score
      </h4>
      <p className="mt-1.5 font-body text-[14px] leading-[20px] text-muted">
        See how your resume performs against applicant tracking systems.
      </p>
      <Link
        href="/sign-up"
        className="mt-3 inline-block rounded-full bg-accent px-6 py-2.5 font-body text-[14px] font-medium text-on-accent no-underline transition-opacity hover:opacity-90"
      >
        Try free
      </Link>
    </div>
  );
}
