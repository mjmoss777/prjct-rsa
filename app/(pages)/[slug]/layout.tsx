import Link from 'next/link';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="font-display text-[24px] leading-[30px] tracking-[-0.02em] text-fg no-underline"
        >
          ResumeATS
        </Link>
        <Link
          href="/"
          className="font-body text-[15px] text-muted no-underline transition-colors hover:text-fg"
        >
          Back to home
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-4">{children}</main>
    </div>
  );
}
